"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const transactions = [
  { id: 1, source: "Your Donation", amount: 250, date: "2023-11-01", status: "Completed" },
  { id: 2, source: "Corporate Match", amount: 250, date: "2023-11-01", status: "Completed" },
  { id: 3, source: "Community Fundraiser", amount: 500, date: "2023-10-28", status: "Completed" },
  { id: 4, source: "Anonymous Donor", amount: 300, date: "2023-10-25", status: "Completed" },
  { id: 5, source: "Monthly Donors", amount: 450, date: "2023-10-20", status: "Completed" },
]

const fundingSources = [
  { name: "Your Donation", amount: 250, percentage: 12.5 },
  { name: "Other Donors", amount: 1250, percentage: 62.5 },
  { name: "Organization Contribution", amount: 500, percentage: 25 },
]

const fundDistribution = [
  { name: "Administrative Fees", amount: 150, percentage: 7.5 },
  { name: "Direct Aid", amount: 1200, percentage: 60 },
  { name: "Educational Programs", amount: 400, percentage: 20 },
  { name: "Healthcare Support", amount: 250, percentage: 12.5 },
]

export function TransactionDetails() {
  return (
    <section id="transaction-details">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Transaction Details</CardTitle>
          <CardDescription className="text-gray-400">
            Transparent breakdown of all donations and how they're being used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources">
            <TabsList className="mb-6 bg-gray-800">
              <TabsTrigger value="sources">Funding Sources</TabsTrigger>
              <TabsTrigger value="distribution">Fund Distribution</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="sources">
              <div className="space-y-6">
                {fundingSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-neutral-100 ${source.name === "Your Donation" ? "font-medium" : ""}`}>{source.name}</span>
                      <span className="text-sm text-neutral-100">
                        ${source.amount} ({source.percentage}%)
                      </span>
                    </div>
                    <Progress
                      value={source.percentage}
                      className={source.name === "Your Donation" ? "bg-muted h-3" : "h-2"}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <div className="space-y-6">
                {fundDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-100">{item.name}</span>
                      <span className="text-sm text-neutral-100">
                        ${item.amount} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="transactions">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="text-neutral-300">
                        <TableCell className="font-medium text-neutral-200">{tx.source}</TableCell>
                        <TableCell>${tx.amount}</TableCell>
                        <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                            {tx.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}