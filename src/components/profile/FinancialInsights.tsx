"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
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
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  TrendingUp,
  DollarSign
} from "lucide-react"
import { formatEther } from "ethers"

interface FinancialInsightsProps {
  walletAddress: string
  ethToMyr: number
}

interface Transaction {
  timeStamp: string
  value: string
  cause_name?: string
  project_title?: string
}

interface CauseBreakdown {
  name: string
  value: number
  valueInMyr: number
  percentage: number
  color: string
}

interface MonthlyData {
  name: string
  eth: number
  myr: number
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
  "#82CA9D", "#A4DE6C", "#D0ED57", "#FAACC5", "#F5A623"
]

export default function FinancialInsights({ walletAddress, ethToMyr }: FinancialInsightsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [causeBreakdown, setCauseBreakdown] = useState<CauseBreakdown[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totalDonated, setTotalDonated] = useState({ eth: 0, myr: 0 })
  const [taxDeduction, setTaxDeduction] = useState(0)
  const [yearlyGoal, setYearlyGoal] = useState({ eth: 1, myr: 12500 })
  const [yearProgress, setYearProgress] = useState(0)

  useEffect(() => {
    async function fetchTransactionData() {
      if (!walletAddress) return

      try {
        setLoading(true)
        setError(null)

        // Fetch transaction data
        const url = `/api/transactions?address=${walletAddress}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.status !== "1" || !data.result) {
          throw new Error(data.message || "Failed to fetch transaction data")
        }

        // Filter outgoing transactions (donations)
        const donationTxs = data.result.filter(
          (tx: any) => tx.from.toLowerCase() === walletAddress.toLowerCase()
        )

        setTransactions(donationTxs)

        // Process the data for insights
        processTransactionData(donationTxs)
      } catch (err: any) {
        console.error("Error fetching transaction data:", err)
        setError(err.message || "Failed to fetch transaction data")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionData()
  }, [walletAddress, ethToMyr])

  const processTransactionData = (txs: Transaction[]) => {
    if (!txs.length) return

    // Calculate total donated
    const totalEth = txs.reduce((sum, tx) => sum + parseFloat(formatEther(tx.value)), 0)
    const totalMyr = totalEth * ethToMyr
    setTotalDonated({ eth: totalEth, myr: totalMyr })

    // Calculate estimated tax deduction (assuming 30% tax relief on donations)
    const estimatedDeduction = totalMyr * 0.3
    setTaxDeduction(estimatedDeduction)

    // Calculate yearly goal progress
    // Assuming the goal is 1 ETH per year
    const progress = (totalEth / yearlyGoal.eth) * 100
    setYearProgress(Math.min(progress, 100))

    // Process cause breakdown
    const causeMap = new Map<string, number>()

    txs.forEach(tx => {
      const cause = tx.cause_name || "Other"
      const amount = parseFloat(formatEther(tx.value))

      if (causeMap.has(cause)) {
        causeMap.set(cause, causeMap.get(cause)! + amount)
      } else {
        causeMap.set(cause, amount)
      }
    })

    // Convert to array for chart
    const breakdownData: CauseBreakdown[] = Array.from(causeMap.entries()).map(([name, value], index) => ({
      name,
      value,
      valueInMyr: value * ethToMyr,
      percentage: (value / totalEth) * 100,
      color: COLORS[index % COLORS.length]
    }))

    setCauseBreakdown(breakdownData)

    // Process monthly data
    const monthMap = new Map<string, number>()

    txs.forEach(tx => {
      const date = new Date(parseInt(tx.timeStamp) * 1000)
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      const amount = parseFloat(formatEther(tx.value))

      if (monthMap.has(monthYear)) {
        monthMap.set(monthYear, monthMap.get(monthYear)! + amount)
      } else {
        monthMap.set(monthYear, amount)
      }
    })

    // Sort by date and convert to array for chart
    const sortedMonths = Array.from(monthMap.entries())
      .map(([name, eth]) => ({
        name,
        eth,
        myr: eth * ethToMyr
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.name.split(' ')
        const [monthB, yearB] = b.name.split(' ')

        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return months.indexOf(monthA) - months.indexOf(monthB)
      })

    setMonthlyData(sortedMonths)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-teal-500" />
            <span>Financial Insights</span>
          </CardTitle>
          <CardDescription>Analyze your donation finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Error loading financial insights: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-teal-500" />
            <span>Financial Insights</span>
          </CardTitle>
          <CardDescription>Analyze your donation finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-teal-50 p-4 rounded-md text-teal-800">
            <p>
              No donation transactions found. Make your first donation to see financial insights!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-teal-500" />
          <span>Financial Insights</span>
        </CardTitle>
        <CardDescription>Analyze your donation finances and tax benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Total Donated</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-teal-800">{totalDonated.eth.toFixed(4)} ETH</span>
              <p className="text-xs text-teal-600 mt-1">
                ≈ {totalDonated.myr.toLocaleString()} MYR
              </p>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <Calculator className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Estimated Tax Relief</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-teal-800">{taxDeduction.toLocaleString()} MYR</span>
              <p className="text-xs text-teal-600 mt-1">
                Based on 30% tax relief on donations
              </p>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Yearly Goal Progress</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-medium text-teal-800">{totalDonated.eth.toFixed(4)} / {yearlyGoal.eth} ETH</span>
              <div className="mt-2 space-y-1">
                <Progress value={yearProgress} className="h-2" />
                <p className="text-xs text-teal-600">
                  {yearProgress.toFixed(0)}% of your yearly donation goal
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="breakdown" className="flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" />
              <span>Donation Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>Monthly Trends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="bg-white rounded-lg border border-teal-100 p-4">
              <h3 className="font-medium text-teal-800 mb-4">Donation Breakdown by Cause</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={causeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    >
                      {causeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(6)} ETH (${(value * ethToMyr).toLocaleString()} MYR)`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {causeBreakdown.map((cause, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cause.color }}></div>
                      <span>{cause.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{cause.value.toFixed(6)} ETH</div>
                      <div className="text-xs text-gray-500">{cause.valueInMyr.toLocaleString()} MYR</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="bg-white rounded-lg border border-teal-100 p-4">
              <h3 className="font-medium text-teal-800 mb-4">Monthly Donation Trends</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0d9488" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'eth') return [`${value.toFixed(6)} ETH`, 'Amount (ETH)']
                        return [`${value.toLocaleString()} MYR`, 'Amount (MYR)']
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="eth" name="ETH" fill="#0d9488" />
                    <Bar yAxisId="right" dataKey="myr" name="MYR" fill="#6b7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-teal-800 mb-2">Donation Insights</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <TrendingUp className="h-4 w-4 mr-2 text-teal-600 mt-0.5" />
                    <span>
                      {monthlyData.length > 1 ? (
                        `Your donations have ${
                          monthlyData[monthlyData.length - 1].eth > monthlyData[monthlyData.length - 2].eth
                            ? 'increased'
                            : 'decreased'
                        } compared to the previous month.`
                      ) : (
                        'Start making regular donations to see your donation trends over time.'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 text-teal-600 mt-0.5" />
                    <span>
                      {monthlyData.length > 0 ? (
                        `Your most generous month was ${
                          monthlyData.reduce((max, item) => item.eth > max.eth ? item : max).name
                        } with ${
                          monthlyData.reduce((max, item) => item.eth > max.eth ? item : max).eth.toFixed(6)
                        } ETH donated.`
                      ) : (
                        'Make your first donation to see monthly insights.'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <DollarSign className="h-4 w-4 mr-2 text-teal-600 mt-0.5" />
                    <span>
                      Your average monthly donation is {
                        (totalDonated.eth / monthlyData.length).toFixed(6)
                      } ETH ({
                        (totalDonated.myr / monthlyData.length).toLocaleString()
                      } MYR).
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 bg-amber-50 rounded-lg border border-amber-100 p-4">
          <h3 className="font-medium text-amber-800 flex items-center mb-2">
            <Calculator className="h-4 w-4 mr-2" />
            Global Tax Deduction Information
          </h3>
          <p className="text-sm text-amber-700 mb-2">
            Many countries offer tax benefits for charitable donations. Based on your total donations
            of {totalDonated.eth.toFixed(4)} ETH ({totalDonated.myr.toLocaleString()} MYR), you may be
            eligible for tax deductions in your country.
          </p>
          <div className="text-xs text-amber-700 space-y-2 mt-3">
            <details className="group">
              <summary className="font-medium cursor-pointer hover:text-amber-800">United States</summary>
              <div className="pl-4 pt-2">
                <p>In the US, donations to qualified 501(c)(3) organizations are generally tax-deductible.
                You may be able to deduct up to 60% of your adjusted gross income (AGI) for cash donations.</p>
              </div>
            </details>
            <details className="group">
              <summary className="font-medium cursor-pointer hover:text-amber-800">United Kingdom</summary>
              <div className="pl-4 pt-2">
                <p>In the UK, donations through Gift Aid allow charities to claim an extra 25p for every £1 you donate.
                Higher rate taxpayers can claim additional relief on their tax return.</p>
              </div>
            </details>
            <details className="group">
              <summary className="font-medium cursor-pointer hover:text-amber-800">Malaysia</summary>
              <div className="pl-4 pt-2">
                <p>In Malaysia, donations to approved charitable organizations may qualify for tax deductions.
                Based on your donations, you could potentially receive up to {taxDeduction.toLocaleString()} MYR in tax relief.</p>
              </div>
            </details>
            <details className="group">
              <summary className="font-medium cursor-pointer hover:text-amber-800">Singapore</summary>
              <div className="pl-4 pt-2">
                <p>In Singapore, donations to approved Institutions of Public Character (IPCs) qualify for a 250% tax deduction.</p>
              </div>
            </details>
            <details className="group">
              <summary className="font-medium cursor-pointer hover:text-amber-800">Australia</summary>
              <div className="pl-4 pt-2">
                <p>In Australia, donations of $2 or more to deductible gift recipients (DGRs) are tax-deductible.</p>
              </div>
            </details>
          </div>
          <p className="text-xs text-amber-600 mt-3">
            Note: This information is provided as general guidance only. Tax laws vary by country and change frequently.
            Please consult with a tax professional for accurate tax advice based on your specific situation and location.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
