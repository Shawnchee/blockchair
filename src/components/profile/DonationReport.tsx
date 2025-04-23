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
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

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

export default function DonationReport({ walletAddress }: { walletAddress: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ethToMyr, setEthToMyr] = useState(12500);
  const [causeFilter, setCauseFilter] = useState<string>("all");
  const [causes, setCauses] = useState<string[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  async function fetchTransactions(walletAddress: string) {
    if (!walletAddress) {
      setError("No wallet address provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch transactions from Etherscan API
      const url = `/api/transactions?address=${walletAddress}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "1") {
        setError(data.message || "No transactions found for the specified wallet address.");
        setLoading(false);
        return;
      }

      // Filter outgoing transactions
      const sentTransactions = data.result.filter(
        (tx) => tx.from.toLowerCase() === walletAddress.toLowerCase()
      );

      // Fetch charity data from Supabase
      const { data: charityData, error: charityError } = await supabase
        .from("charity_2")
        .select("id, title, smart_contract_address, categories");

      if (charityError) {
        console.error("Error fetching data from Supabase:", charityError);
        setError("Failed to fetch project data. Please try again later.");
        setLoading(false);
        return;
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

      // Extract unique causes from charity data
      const allCauses = charityData.flatMap((charity: Charity) => charity.categories || []);
      const uniqueCauses = [...new Set(allCauses)];
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

      setTransactions(transactionsWithDetails);
      setFilteredTransactions(transactionsWithDetails);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again later.");
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

  const exportToPDF = async () => {
    // Create a new PDF document
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

    // Add logo or header image (optional)
    // If you have a logo, you can add it like this:
    // doc.addImage('/path/to/logo.png', 'PNG', 10, 10, 40, 20);

    // Set colors and styling
    const primaryColor = [0, 128, 128]; // Teal color

    // Add title with styling
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Donation Impact Report", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    // Add subtitle
    doc.setFontSize(12);
    doc.text("Your contributions are making a difference", doc.internal.pageSize.getWidth() / 2, 23, { align: 'center' });

    // Reset text color for the rest of the document
    doc.setTextColor(0, 0, 0);

    // Add report date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${dateStr}`, doc.internal.pageSize.getWidth() - 20, 35, { align: 'right' });

    // Add wallet information section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("Donor Information", 14, 45);

    // Add wallet address with styling
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 47, 80, 47);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Wallet Address:", 14, 55);
    doc.setFont('courier', 'normal'); // Monospace font for the address
    doc.text(walletAddress ? truncateAddress(walletAddress) : "Not connected", 50, 55);

    // Add donation summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("Donation Summary", 14, 65);
    doc.setDrawColor(...primaryColor);
    doc.line(14, 67, 80, 67);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Check if we have transactions
    if (filteredTransactions.length === 0) {
      // No transactions case
      doc.text("No donation transactions found.", 14, 75);

      // Add information about how to make donations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text("How to Make a Donation", 14, 90);
      doc.setDrawColor(...primaryColor);
      doc.line(14, 92, 100, 92);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("1. Browse charity projects on the platform", 14, 100);
      doc.text("2. Select a project that aligns with your values", 14, 108);
      doc.text("3. Connect your wallet and make a donation", 14, 116);
      doc.text("4. Return to this page to view your donation impact", 14, 124);

      // Add a note about impact
      doc.setFont('helvetica', 'italic');
      doc.text("Your donations can make a real difference in the world.", 14, 140);
      doc.text("Start your giving journey today!", 14, 148);
    } else {
      // Calculate summary statistics
      const totalDonated = calculateTotalDonated();
      const totalMYR = (parseFloat(totalDonated) * ethToMyr).toFixed(2);
      const donationCount = filteredTransactions.length;

      // Add summary statistics
      doc.text(`Total Donations: ${donationCount} transactions`, 14, 75);
      doc.text(`Total Amount: ${totalDonated} ETH (${totalMYR} MYR)`, 14, 82);

      // If we have cause data, add a breakdown by cause
      if (causes.length > 0) {
        // Group transactions by cause
        const causeBreakdown = {};
        filteredTransactions.forEach(tx => {
          const cause = tx.cause_name || "Uncategorized";
          if (!causeBreakdown[cause]) {
            causeBreakdown[cause] = 0;
          }
          causeBreakdown[cause] += parseFloat(formatEther(tx.value));
        });

        // Add cause breakdown section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("Donation Breakdown by Cause", 14, 95);
        doc.setDrawColor(...primaryColor);
        doc.line(14, 97, 100, 97);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        let yPos = 105;
        Object.entries(causeBreakdown).forEach(([cause, amount], index) => {
          const percentage = ((amount as number) / parseFloat(totalDonated) * 100).toFixed(1);
          doc.text(`${cause}: ${(amount as number).toFixed(6)} ETH (${percentage}%)`, 14, yPos);
          yPos += 7;
        });
      }

      // Add transaction table
      const tableColumn = ["Date", "Project", "Cause", "Amount (ETH)", "Amount (MYR)"];
      const tableRows = filteredTransactions.map(tx => [
        formatDate(tx.timeStamp),
        tx.project_title,
        tx.cause_name || "Uncategorized",
        parseFloat(formatEther(tx.value)).toFixed(6),
        convertEthToMyr(formatEther(tx.value))
      ]);

      // Add transaction table title
      const tableY = causes.length > 0 ? 130 : 95;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text("Transaction Details", 14, tableY - 5);
      doc.setDrawColor(...primaryColor);
      doc.line(14, tableY - 3, 80, tableY - 3);

      // @ts-ignore - jspdf-autotable types are not included
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: tableY,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 250, 250] },
        margin: { top: 10 }
      });
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      doc.text('Thank you for your interest in making a positive impact.', pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, pageSize.getWidth() / 2, pageHeight - 5, { align: 'center' });
    }

    doc.save("donation_impact_report.pdf");
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
