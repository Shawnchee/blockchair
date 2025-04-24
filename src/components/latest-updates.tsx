"use client"

import Link from "next/link"
import { Calendar, Check, ExternalLink, Heart, School, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface MilestoneTransaction {
  index: number
  name: string
  targetAmount: number
  txHash: string
  wallet: string
  company_name: string
  websiteurl: string
}

interface LatestUpdatesProps {
  contractAddress: string
  milestoneTransactions: MilestoneTransaction[]
  campaignTitle: string
  isLoading?: boolean
}

export default function LatestUpdates({
  contractAddress,
  milestoneTransactions,
  campaignTitle,
  isLoading = false,
}: LatestUpdatesProps) {
  // Sample impact data - in a real app, this would come from your database
  const impactStories = [
    {
      id: 1,
      title: "School Supplies Distributed",
      description: `Thanks to your generous support, we've provided essential school supplies to 20 children in need. These supplies include notebooks, pens, backpacks, and textbooks.`,
      date: "May 15, 2023",
      icon: School,
      category: "education",
    },
    {
      id: 2,
      title: "Community Support Expanded",
      description: `Your donations have helped us expand our community outreach program, allowing us to serve 35% more families than last month.`,
      date: "April 28, 2023",
      icon: Users,
      category: "community",
    },
    {
      id: 3,
      title: "Healthcare Initiative Launched",
      description: `We've successfully launched our healthcare initiative, providing basic medical supplies and services to underserved communities.`,
      date: "April 10, 2023",
      icon: Heart,
      category: "healthcare",
    },
  ]

  return (
    <Card className="border-0 bg-white shadow-sm dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium">Milestone Transfers</CardTitle>
        <CardDescription>Stay informed about the flow of your donation funds</CardDescription>
      </CardHeader>
      {/* Milestone Transfers Tab */}
      <CardContent className="space-y-4">
            {isLoading ? (
              // Skeleton loading state for milestones
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={`skeleton-${index}`} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                ))
            ) : milestoneTransactions.length > 0 ? (
              milestoneTransactions.map((milestone, index) => (
                <div key={index} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Milestone {milestone.index + 1}: {milestone.name}
                        </h4>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">
                          {(Number(milestone.targetAmount) / 1e18).toFixed(4)} ETH&nbsp;
                        </span>
                        has been transferred to {milestone.company_name}'s wallet
                      </p>

                      {milestone.wallet && (
                        <div className="flex items-center">
                          <span className="font-mono">Recipient: {milestone.wallet}</span>
                        </div>
                      )}
                      {milestone.txHash && (
                        <Link
                          href={`https://sepolia.etherscan.io/address/${contractAddress}#internaltx`}
                          target="_blank"
                          className="flex items-center text-primary hover:text-primary/80"
                        >
                          <span className="font-mono">View transaction</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No milestone transfers have been completed yet.</p>
              </div>
            )}
      </CardContent>
    </Card>
  )
}
