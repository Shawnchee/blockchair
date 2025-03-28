"use client"
import Link from "next/link"
import { Calendar, Check, ExternalLink, Heart, School, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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
  milestoneTransactions: MilestoneTransaction[]
  campaignTitle: string
}

export default function LatestUpdates({ milestoneTransactions, campaignTitle }: LatestUpdatesProps) {
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

  console.log("info",milestoneTransactions);

  return (
    <Card className="border-0 bg-white shadow-sm dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium">Latest Updates</CardTitle>
        <CardDescription>Stay informed about the progress and impact of your donations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="impact">
          <TabsList className="mb-4">
            <TabsTrigger value="impact">Impact Stories</TabsTrigger>
            <TabsTrigger value="milestones">Milestone Transfers</TabsTrigger>
          </TabsList>

          {/* Impact Stories Tab */}
          <TabsContent value="impact" className="space-y-4">
            {impactStories.map((story) => (
              <div key={story.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <story.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{story.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {story.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{story.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {story.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {impactStories.length === 0 && (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No impact stories available yet. Check back soon!</p>
              </div>
            )}
          </TabsContent>
            
          {/* Milestone Transfers Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {milestoneTransactions.length > 0 ? (
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
                              has been transferred to {milestone.company_name}'s' wallet
                      </p>

                      {milestone.wallet && (
                        <div className="flex items-center">
                          <span className="font-mono">
                            Recipient: {milestone.wallet}
                          </span>
                        </div>
                      )}
                      {milestone.txHash && (
                        <Link
                          href={`https://sepolia.etherscan.io/tx/0x${milestone.txHash}`}
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
                <p className="text-muted-foreground">
                  No milestone transfers have been completed yet.
                </p>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  )
}

