"use client";

import { useState, useEffect, useRef } from "react";
import { ethers, formatEther } from "ethers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, FileDown, Filter, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import jsPDF and jspdf-autotable
import { jsPDF } from "jspdf";
// Add the autotable plugin
import 'jspdf-autotable';
// Declare the autoTable method on jsPDF instances
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Transaction {
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  project_title: string;
  cause_name?: string;
}

interface Charity {
  id: string;
  title: string;
  smart_contract_address: string;
  categories: string[];
}

interface DonationInsights {
  impactStatements: string[];
  patterns: string[];
  suggestions: string[];
}

interface DonationReportProps {
  walletAddress: string;
  ethToMyr?: number;
}

export default function DonationReport({ walletAddress, ethToMyr = 12500 }: DonationReportProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [causeFilter, setCauseFilter] = useState<string>("all");
  const [causes, setCauses] = useState<string[]>([]);
  const [insights, setInsights] = useState<DonationInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  async function fetchTransactions(walletAddress: string) {
    if (!walletAddress || walletAddress === "0x0000000000000000000000000000000000000000") {
      setError("Please connect a valid wallet address");
      setLoading(false);
      setTransactions([]);
      setFilteredTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch transactions from Etherscan API
      const url = `/api/transactions?address=${walletAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "1" || !data.result) {
        throw new Error(data.message || "Failed to fetch transaction data");
      }

      // Filter outgoing transactions
      const sentTransactions = data.result.filter(
        (tx) => tx.from.toLowerCase() === walletAddress.toLowerCase()
      );

      // Fetch charity data from Supabase with retry logic
      let charityData;
      let charityError;
      for (let i = 0; i < 3; i++) { // Try 3 times
        const { data, error } = await supabase
          .from("charity_2")
          .select("id, title, smart_contract_address, categories");

        if (data) {
          charityData = data;
          break;
        }
        charityError = error;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }

      if (charityError || !charityData) {
        console.error("Error fetching data from Supabase:", charityError);
        throw new Error("Failed to fetch charity data. Please try again later.");
      }

      // Filter transactions that match charity smart contract addresses
      const filteredTransactions = sentTransactions
        .filter((tx) => parseFloat(tx.value) > 0)
        .filter((tx) =>
          charityData.some(
            (item) =>
              item.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
          )
        );

      if (filteredTransactions.length === 0) {
        setError("No donation transactions found for this wallet address");
        setTransactions([]);
        setFilteredTransactions([]);
        setLoading(false);
        return;
      }

      // Extract unique causes from charity data
      const allCauses = charityData.flatMap((charity: Charity) => charity.categories || []);
      const uniqueCauses = [...new Set(allCauses)].filter(Boolean) as string[];
      setCauses(uniqueCauses);

      // Add project title and cause to transactions
      const transactionsWithDetails = filteredTransactions.map((tx) => {
        const charity = charityData.find(
          (item) =>
            item.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
        );

        return {
          ...tx,
          project_title: charity ? charity.title : "Unknown Project",
          cause_name: charity && charity.categories ? charity.categories[0] : "Uncategorized",
        };
      });

      // Sort transactions by timestamp (newest first)
      const sortedTransactions = transactionsWithDetails.sort(
        (a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp)
      );

      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to fetch transactions. Please try again later.");
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions(walletAddress);
    }
  }, [walletAddress]);

  useEffect(() => {
    // Apply filters when transactions or causeFilter changes
    if (transactions.length > 0) {
      let filtered = [...transactions];

      // Apply cause filter
      if (causeFilter !== "all") {
        filtered = filtered.filter(tx => tx.cause_name === causeFilter);
      }

      setFilteredTransactions(filtered);
    }
  }, [transactions, causeFilter]);

  const truncateAddress = (address: string) => {
    if (!address) return "Contract Creation";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const convertEthToMyr = (ethValue: string) => {
    return (parseFloat(ethValue) * ethToMyr).toFixed(2);
  };

  const calculateTotalDonated = () => {
    return filteredTransactions.reduce((total, tx) => {
      return total + parseFloat(formatEther(tx.value));
    }, 0).toFixed(6);
  };

  const exportToCSV = () => {
    const csvRows = [
      ["Date", "Project Title", "Cause", "Hash", "To", "Value (MYR)", "Value (ETH)"], // Header row
      ...filteredTransactions.map((tx) => [
        formatDate(tx.timeStamp),
        tx.project_title,
        tx.cause_name || "Uncategorized",
        tx.hash,
        tx.to || "Contract Creation",
        convertEthToMyr(formatEther(tx.value)),
        parseFloat(formatEther(tx.value)).toFixed(6),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "donation_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to split long text into multiple lines for PDF
  const splitTextIntoLines = (text: string, maxCharsPerLine: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Function to generate insights using OpenAI
  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      // Prepare donation data for analysis
      const donationData = {
        transactions: filteredTransactions.map(tx => ({
          amount: parseFloat(formatEther(tx.value)),
          timestamp: tx.timeStamp,
          cause: tx.cause_name || 'Uncategorized',
          project: tx.project_title
        })),
        totalDonated: parseFloat(calculateTotalDonated()),
        donationCount: filteredTransactions.length,
        causes: Array.from(new Set(filteredTransactions.map(tx => tx.cause_name || 'Uncategorized'))),
        dateRange: {
          earliest: new Date(Math.min(...filteredTransactions.map(tx => parseInt(tx.timeStamp) * 1000))).toISOString(),
          latest: new Date(Math.max(...filteredTransactions.map(tx => parseInt(tx.timeStamp) * 1000))).toISOString()
        }
      };

      const response = await fetch('/api/generateDonationInsights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationData })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
      return data;
    } catch (error) {
      console.error('Error generating insights:', error);
      return null;
    } finally {
      setInsightsLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      // Generate insights before creating PDF
      let insightData = insights;
      if (!insightData) {
        insightData = await generateInsights();
      }

      // Create a simplified PDF report that's more compatible with jsPDF v3.0.1
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Get current date for the report
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Set colors and styling - using teal color (0, 128, 128)
      const primaryColor = [0, 128, 128] as [number, number, number]; // Teal

      // Add title
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("Donation Impact Report", 105, 18, { align: 'center' });

      // Reset text color for the rest of the document
      doc.setTextColor(0, 0, 0);

      if (filteredTransactions.length === 0) {
        // No transactions case
        doc.setFont('helvetica', 'normal');
        doc.text("No donation transactions found.", 14, 65);
        doc.text("Connect your wallet and make a donation to see your impact.", 14, 72);
      } else {
        // Add report date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${dateStr}`, 190, 38, { align: 'right' });

        // Add wallet information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Wallet Address:", 14, 45);
        doc.setFont('helvetica', 'normal');
        doc.text(walletAddress ? truncateAddress(walletAddress) : "Not connected", 50, 45);
        doc.text(`Full address: ${walletAddress}`, 14, 52);

        // Calculate summary statistics
        const totalDonated = calculateTotalDonated();
        const totalMYR = (parseFloat(totalDonated) * ethToMyr).toFixed(2);
        const donationCount = filteredTransactions.length;

        // Group transactions by cause
        interface CauseGroup {
          count: number;
          totalETH: number;
          totalMYR: number;
          transactions: Transaction[];
        }

        const causeGroups: Record<string, CauseGroup> = {};
        filteredTransactions.forEach(tx => {
          const cause = tx.cause_name || "Uncategorized";
          if (!causeGroups[cause]) {
            causeGroups[cause] = {
              count: 0,
              totalETH: 0,
              totalMYR: 0,
              transactions: []
            };
          }
          causeGroups[cause].count += 1;
          const ethAmount = parseFloat(formatEther(tx.value));
          causeGroups[cause].totalETH += ethAmount;
          causeGroups[cause].totalMYR += ethAmount * ethToMyr;
          causeGroups[cause].transactions.push(tx);
        });

        // Get earliest and latest donation dates
        const dates = filteredTransactions.map(tx => parseInt(tx.timeStamp));
        const earliestDate = new Date(Math.min(...dates) * 1000);
        const latestDate = new Date(Math.max(...dates) * 1000);
        const dateRange = `${earliestDate.toLocaleDateString()} - ${latestDate.toLocaleDateString()}`;

        // Add donation summary section
        doc.setFillColor(240, 250, 250);
        doc.rect(14, 60, 180, 35, 'F');
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(14, 60, 180, 35, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Donation Summary", 105, 68, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Total Donations: ${donationCount} transactions`, 24, 76);
        doc.text(`Total Amount: ${totalDonated} ETH (${totalMYR} MYR)`, 24, 83);
        doc.text(`Date Range: ${dateRange}`, 24, 90);

        // Add cause breakdown section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Donation Breakdown by Cause", 105, 110, { align: 'center' });

        let yPos = 120;
        Object.entries(causeGroups).forEach(([cause, data], index) => {
          const percentage = ((data.totalETH / parseFloat(totalDonated)) * 100).toFixed(1);

          // Add cause header
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${cause} (${percentage}%)`, 24, yPos);

          // Add cause details
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Donations: ${data.count}`, 34, yPos + 7);
          doc.text(`Amount: ${data.totalETH.toFixed(6)} ETH (${data.totalMYR.toFixed(2)} MYR)`, 34, yPos + 14);

          // Draw a small colored rectangle for the cause
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(18, yPos - 3, 4, 4, 'F');

          yPos += 22;

          // Add page break if needed
          if (yPos > 250 && index < Object.entries(causeGroups).length - 1) {
            doc.addPage();
            yPos = 30;
          }
        });

        // Add impact insights section
        doc.addPage();

        // Add title for impact page
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Your Donation Impact", 105, 13, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Add impact insights
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Impact Insights", 105, 30, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);

        // Add AI-generated impact statements if available, otherwise use generic ones
        let impactYPos = 40;

        if (insights && insights.impactStatements && insights.impactStatements.length > 0) {
          // Add AI-generated impact statements
          insights.impactStatements.forEach((statement, index) => {
            const lines = splitTextIntoLines(statement, 80); // Split long statements into multiple lines
            lines.forEach((line, lineIndex) => {
              const prefix = lineIndex === 0 ? "• " : "  ";
              doc.text(`${prefix}${line}`, 20, impactYPos + (index * 20) + (lineIndex * 7));
            });
            impactYPos += 10 + (lines.length * 7);
          });
        } else {
          // Fallback to generic statements based on causes
          if (causeGroups["Education"]) {
            doc.text("• Your donations to Education have helped provide learning resources and", 20, impactYPos);
            doc.text("  opportunities for students in need.", 20, impactYPos + 7);
            impactYPos += 17;
          }

          if (causeGroups["Healthcare"]) {
            doc.text("• Your contributions to Healthcare initiatives have supported medical services", 20, impactYPos);
            doc.text("  and treatments for those who need them most.", 20, impactYPos + 7);
            impactYPos += 17;
          }

          if (causeGroups["Environment"]) {
            doc.text("• Your environmental donations have contributed to conservation efforts", 20, impactYPos);
            doc.text("  and sustainability projects around the world.", 20, impactYPos + 7);
            impactYPos += 17;
          }

          // Add generic impact for other causes
          doc.text("• Your generosity has made a real difference in the lives of many people.", 20, impactYPos);
          doc.text("• The transparency of blockchain ensures your donations reach their intended recipients.", 20, impactYPos + 10);
          doc.text("• Your continued support helps build a better future for communities in need.", 20, impactYPos + 20);
        }

        // Add donation frequency insights
        impactYPos += 35;
        doc.setFont('helvetica', 'bold');
        doc.text("Donation Patterns", 105, impactYPos, { align: 'center' });

        // Calculate donation frequency
        interface MonthlyData {
          count: number;
          total: number;
        }

        const monthlyGrouping: Record<string, MonthlyData> = {};
        filteredTransactions.forEach(tx => {
          const date = new Date(parseInt(tx.timeStamp) * 1000);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

          if (!monthlyGrouping[monthYear]) {
            monthlyGrouping[monthYear] = {
              count: 0,
              total: 0
            };
          }

          monthlyGrouping[monthYear].count += 1;
          monthlyGrouping[monthYear].total += parseFloat(formatEther(tx.value));
        });

        const monthCount = Object.keys(monthlyGrouping).length;
        const avgDonationsPerMonth = monthCount > 0 ? (donationCount / monthCount).toFixed(1) : 0;

        // Find most active cause
        let mostActiveCause = "None";
        let maxCount = 0;

        Object.entries(causeGroups).forEach(([cause, data]) => {
          if (data.count > maxCount) {
            maxCount = data.count;
            mostActiveCause = cause;
          }
        });

        doc.setFont('helvetica', 'normal');
        impactYPos += 10;

        // Add AI-generated patterns if available, otherwise use calculated ones
        if (insights && insights.patterns && insights.patterns.length > 0) {
          insights.patterns.forEach((pattern, index) => {
            const lines = splitTextIntoLines(pattern, 80);
            lines.forEach((line, lineIndex) => {
              const prefix = lineIndex === 0 ? "• " : "  ";
              doc.text(`${prefix}${line}`, 20, impactYPos + (index * 15) + (lineIndex * 7));
            });
            impactYPos += 5 + (lines.length * 7);
          });
        } else {
          // Fallback to basic patterns
          doc.text(`• Average donations per month: ${avgDonationsPerMonth}`, 20, impactYPos);
          doc.text(`• Most active cause: ${mostActiveCause}`, 20, impactYPos + 10);
        }

        // Add suggestions section if available
        if (insights && insights.suggestions && insights.suggestions.length > 0) {
          impactYPos += 30;
          doc.setFont('helvetica', 'bold');
          doc.text("Suggestions for Future Donations", 105, impactYPos, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          impactYPos += 10;

          insights.suggestions.forEach((suggestion, index) => {
            const lines = splitTextIntoLines(suggestion, 80);
            lines.forEach((line, lineIndex) => {
              const prefix = lineIndex === 0 ? "• " : "  ";
              doc.text(`${prefix}${line}`, 20, impactYPos + (index * 15) + (lineIndex * 7));
            });
            impactYPos += 5 + (lines.length * 7);
          });
        }

        // Add transaction table
        doc.addPage();

        // Add title for transaction details page
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Transaction Details", 105, 13, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        const tableColumn = ["Date", "Project", "Cause", "Amount (ETH)", "Amount (MYR)"];
        const tableRows = filteredTransactions.map(tx => [
          formatDate(tx.timeStamp),
          tx.project_title,
          tx.cause_name || "Uncategorized",
          parseFloat(formatEther(tx.value)).toFixed(6),
          convertEthToMyr(formatEther(tx.value))
        ]);

        try {
          // Add table using autoTable
          doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: {
              fillColor: primaryColor,
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [240, 250, 250] },
            margin: { top: 10 }
          });
        } catch (tableError) {
          console.error("Error creating table:", tableError);
          // Fallback to simple text if autoTable fails
          doc.setFont('helvetica', 'normal');
          doc.text("Transaction data available in CSV export.", 14, 40);
        }
      }

      // Add footer to all pages
      try {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          const pageWidth = doc.internal.pageSize.width;
          const pageHeight = doc.internal.pageSize.height;
          doc.text('Thank you for your donations. Your generosity makes a difference.', pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }
      } catch (footerError) {
        console.error("Error adding footer:", footerError);
        // Continue without footer if there's an error
      }

      // Save the PDF
      doc.save("donation_impact_report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF report. Please try again.");
    }
  };

  const resetFilters = () => {
    setCauseFilter("all");
    setFilteredTransactions(transactions);
  };

  return (
    <div className="flex flex-col items-center justify-start py-4">
      <Card className="w-full max-w-7xl bg-white/90 backdrop-blur-sm border">
        <CardHeader>
          <CardTitle className="text-2xl text-black">
            Donation Report
          </CardTitle>
          <CardDescription className="text-gray-600">
            View and export your donation history
          </CardDescription>
          <div className="mt-2 p-2 bg-teal-50 rounded-md">
            <code className="text-sm font-mono break-all text-teal-800">
              {walletAddress}
            </code>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Cause</label>
              <Select value={causeFilter} onValueChange={setCauseFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a cause" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Causes</SelectItem>
                  {causes.map((cause) => (
                    <SelectItem key={cause} value={cause}>
                      {cause}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-none self-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                <p className="text-teal-800">Loading donation history...</p>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-12 w-full bg-teal-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="rounded-md border border-teal-200" ref={tableRef}>
              <Table className="rounded-md border border-teal-200 bg-white">
                <TableCaption className="text-teal-800 my-4">
                  Total Donated: {calculateTotalDonated()} ETH
                </TableCaption>
                <TableHeader className="bg-teal-600">
                  <TableRow>
                    <TableHead className="text-teal-100">Date</TableHead>
                    <TableHead className="text-teal-100">Project Title</TableHead>
                    <TableHead className="text-teal-100">Cause</TableHead>
                    <TableHead className="text-teal-100">Hash</TableHead>
                    <TableHead className="text-right text-teal-100">
                      Value (ETH)
                    </TableHead>
                    <TableHead className="text-right text-teal-100">
                      Value (MYR)
                    </TableHead>
                    <TableHead className="text-center text-teal-100">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500"
                      >
                        No donation transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx, index) => (
                      <TableRow key={index} className="hover:bg-teal-50">
                        <TableCell className="font-medium text-gray-700">
                          {formatDate(tx.timeStamp)}
                        </TableCell>
                        <TableCell className="font-medium text-gray-700">
                          {tx.project_title}
                        </TableCell>
                        <TableCell className="font-medium text-gray-700">
                          {tx.cause_name || "Uncategorized"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-2">
                                {truncateAddress(tx.hash)}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{tx.hash}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          {parseFloat(formatEther(tx.value)).toFixed(6)}
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          {convertEthToMyr(formatEther(tx.value))}
                        </TableCell>
                        <TableCell className="text-center">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer text-teal-800 border-teal-200 hover:bg-teal-500 hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4 mr-1 text-teal-800 hover:text-white" />
                              View
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex justify-center mt-6 gap-4">
            {!loading && !error && filteredTransactions.length > 0 && (
              <Button
                onClick={exportToCSV}
                className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            )}
            <Button
              onClick={exportToPDF}
              disabled={loading || !!error}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Generate Impact Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
