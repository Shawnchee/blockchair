"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { 
  Calculator, 
  Download, 
  FileText, 
  TrendingUp,
  DollarSign,
  Calendar,
  HelpCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaxInsightsProps {
  walletAddress: string
  ethToMyr: number
  totalDonated: { eth: number; myr: number }
}

export default function TaxInsights({ walletAddress, ethToMyr, totalDonated }: TaxInsightsProps) {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear())
  const [taxDeduction, setTaxDeduction] = useState(0)
  const [taxSavings, setTaxSavings] = useState(0)
  const [showTaxInfo, setShowTaxInfo] = useState(false)
  const [taxBracket, setTaxBracket] = useState(24) // Default tax bracket percentage
  
  // Sample tax brackets for Malaysia
  const taxBrackets = [
    { range: "0 - 5,000 MYR", rate: 0 },
    { range: "5,001 - 20,000 MYR", rate: 1 },
    { range: "20,001 - 35,000 MYR", rate: 3 },
    { range: "35,001 - 50,000 MYR", rate: 8 },
    { range: "50,001 - 70,000 MYR", rate: 13 },
    { range: "70,001 - 100,000 MYR", rate: 21 },
    { range: "100,001 - 250,000 MYR", rate: 24 },
    { range: "250,001 - 400,000 MYR", rate: 24.5 },
    { range: "400,001 - 600,000 MYR", rate: 25 },
    { range: "600,001 - 1,000,000 MYR", rate: 26 },
    { range: "1,000,001 - 2,000,000 MYR", rate: 28 },
    { range: "Above 2,000,000 MYR", rate: 30 }
  ]
  
  // Monthly donation data
  const monthlyData = [
    { name: "Jan", amount: totalDonated.myr * 0.1 },
    { name: "Feb", amount: totalDonated.myr * 0.05 },
    { name: "Mar", amount: totalDonated.myr * 0.15 },
    { name: "Apr", amount: totalDonated.myr * 0.2 },
    { name: "May", amount: totalDonated.myr * 0.1 },
    { name: "Jun", amount: totalDonated.myr * 0.05 },
    { name: "Jul", amount: totalDonated.myr * 0.1 },
    { name: "Aug", amount: totalDonated.myr * 0.05 },
    { name: "Sep", amount: totalDonated.myr * 0.05 },
    { name: "Oct", amount: totalDonated.myr * 0.05 },
    { name: "Nov", amount: totalDonated.myr * 0.05 },
    { name: "Dec", amount: totalDonated.myr * 0.05 }
  ]
  
  // Donation categories for tax purposes
  const donationCategories = [
    { name: "Approved Institutions", value: totalDonated.myr * 0.6, color: "#0d9488", deductible: true },
    { name: "Government Projects", value: totalDonated.myr * 0.2, color: "#0891b2", deductible: true },
    { name: "Sports Activities", value: totalDonated.myr * 0.1, color: "#6366f1", deductible: true },
    { name: "Other Donations", value: totalDonated.myr * 0.1, color: "#d1d5db", deductible: false }
  ]
  
  useEffect(() => {
    // Calculate tax deduction (assuming 100% deduction for approved donations)
    const deductibleAmount = donationCategories
      .filter(cat => cat.deductible)
      .reduce((sum, cat) => sum + cat.value, 0)
    
    setTaxDeduction(deductibleAmount)
    
    // Calculate tax savings based on tax bracket
    const savings = deductibleAmount * (taxBracket / 100)
    setTaxSavings(savings)
  }, [totalDonated, taxBracket])
  
  // Generate PDF report data
  const generateTaxReport = () => {
    // In a real app, this would generate a PDF with tax information
    alert("Tax report would be generated here with donation details for tax filing purposes")
  }
  
  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-teal-800 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-teal-600" />
              Tax Insights
            </CardTitle>
            <CardDescription>
              Understand the tax benefits of your charitable donations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generateTaxReport} className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Generate Tax Report</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div 
            className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col hover:shadow-md transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center text-teal-700 mb-1">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Tax Deductible Amount</span>
              </div>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-teal-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      This is the total amount of your donations that qualify for tax deductions under Malaysian tax law.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <div className="mt-1">
              <motion.span 
                className="text-2xl font-bold text-teal-800 block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {taxDeduction.toLocaleString()} MYR
              </motion.span>
              <motion.p 
                className="text-xs text-teal-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {((taxDeduction / totalDonated.myr) * 100).toFixed(0)}% of your total donations
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col hover:shadow-md transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setShowTaxInfo(!showTaxInfo)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center text-teal-700 mb-1">
                <Calculator className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Estimated Tax Savings</span>
              </div>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-teal-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      This is an estimate of how much you could save on taxes based on your donations and current tax bracket.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <div className="mt-1">
              <AnimatePresence mode="wait">
                {showTaxInfo ? (
                  <motion.div 
                    key="taxBracketSelector"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2"
                  >
                    <label className="text-xs text-teal-700 block mb-1">Your Tax Bracket:</label>
                    <select 
                      value={taxBracket}
                      onChange={(e) => setTaxBracket(Number(e.target.value))}
                      className="w-full p-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      {taxBrackets.map((bracket, index) => (
                        <option key={index} value={bracket.rate}>
                          {bracket.range} ({bracket.rate}%)
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ) : (
                  <motion.span 
                    key="taxSavings"
                    className="text-2xl font-bold text-teal-800 block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {taxSavings.toLocaleString()} MYR
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.p 
                className="text-xs text-teal-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Based on {taxBracket}% tax bracket
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col hover:shadow-md transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center text-teal-700 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Tax Year</span>
              </div>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-teal-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      The current tax year for which these calculations apply.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <div className="mt-1">
              <motion.div 
                className="flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-2xl font-bold text-teal-800">{taxYear}</span>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setTaxYear(prev => prev - 1)}
                  >
                    -
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setTaxYear(prev => prev + 1)}
                  >
                    +
                  </Button>
                </div>
              </motion.div>
              <motion.p 
                className="text-xs text-teal-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Year of Assessment {taxYear + 1}
              </motion.p>
            </div>
          </motion.div>
        </div>
        
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="breakdown" className="flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              <span>Donation Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Monthly Donations</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakdown" className="space-y-4">
            <div className="bg-white rounded-lg border border-teal-100 p-4">
              <h3 className="font-medium text-teal-800 mb-4">Donation Categories for Tax Purposes</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donationCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {donationCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} MYR`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                  <h4 className="text-sm font-medium text-teal-800 mb-1">Tax Deduction Eligibility</h4>
                  <p className="text-xs text-teal-700">
                    In Malaysia, donations to government-approved institutions and organizations are tax-deductible. 
                    Donations to approved institutions or organizations are eligible for tax deductions up to 10% of your aggregate income.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 className="text-sm font-medium text-green-800 mb-1">Deductible Donations</h4>
                    <p className="text-xs text-green-700">
                      Donations to approved institutions, government projects, and sports activities are generally tax-deductible in Malaysia.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <h4 className="text-sm font-medium text-amber-800 mb-1">Non-Deductible Donations</h4>
                    <p className="text-xs text-amber-700">
                      Donations to non-approved organizations or foreign charities may not qualify for tax deductions under Malaysian tax law.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <div className="bg-white rounded-lg border border-teal-100 p-4">
              <h3 className="font-medium text-teal-800 mb-4">Monthly Donation Trends ({taxYear})</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} MYR`, 'Amount']}
                    />
                    <Bar dataKey="amount" name="Donation Amount" fill="#0d9488" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-teal-50 p-3 rounded-lg border border-teal-100">
                <h4 className="text-sm font-medium text-teal-800 mb-1">Tax Filing Tip</h4>
                <p className="text-xs text-teal-700">
                  Keep all donation receipts organized by month to make tax filing easier. 
                  In Malaysia, the tax filing deadline is typically April 30th for individuals without business income.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-between items-center">
          <p className="text-xs text-teal-600">
            <span className="font-medium">Disclaimer:</span> This information is for educational purposes only and should not be considered as tax advice. 
            Please consult with a tax professional for advice specific to your situation.
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Download Data</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
