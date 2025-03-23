"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CheckCircle, DollarSign, HeartHandshake, Users } from "lucide-react"

const updates = [
  {
    id: 1,
    title: "Milestone Reached: $2,000 Raised!",
    date: "2023-11-05",
    description:
      "Thanks to your generous support, we've reached our initial funding goal of $2,000. These funds will directly support 20 families in need.",
    type: "milestone",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  {
    id: 2,
    title: "New Donation: Corporate Match",
    date: "2023-11-01",
    description:
      "A local business has matched your donation of $250, doubling your impact! The additional $250 will go toward educational supplies.",
    type: "donation",
    icon: <DollarSign className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 3,
    title: "Community Event Scheduled",
    date: "2023-10-28",
    description:
      "Join us for a community fundraiser on November 15th. Meet the team and learn more about how your donations are making a difference.",
    type: "event",
    icon: <Users className="h-5 w-5 text-purple-500" />,
  },
  {
    id: 4,
    title: "Beneficiary Update: School Supplies Delivered",
    date: "2023-10-20",
    description:
      "Your donations have helped provide school supplies to 50 children in underserved communities. See the impact in our latest blog post.",
    type: "impact",
    icon: <HeartHandshake className="h-5 w-5 text-red-500" />,
  },
]

export function LatestUpdates() {
  return (
    <section id="latest-updates">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Latest Updates</CardTitle>
          <CardDescription className="text-gray-400">
            Stay informed about the progress and impact of your donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-6 bg-gray-800">
              <TabsTrigger value="all">All Updates</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="impact">Impact Stories</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className="flex gap- p-4 border border-gray-700 rounded-lg bg-gray-800">
                  <div className="mt-1">{update.icon}</div>
                  <div className="space-y-2 flex-auto px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-neutral-100">{update.title}</h3>
                      <Badge variant="outline" className="ml-auto text-primary">
                        {update.type}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {new Date(update.date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-neutral-400">{update.description}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-6">
              {updates
                .filter((update) => update.type === "milestone")
                .map((update) => (
                  <div key={update.id} className="flex gap-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
                    <div className="mt-1">{update.icon}</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium  text-neutral-100">{update.title}</h3>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {new Date(update.date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-neutral-400">{update.description}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="impact" className="space-y-6">
              {updates
                .filter((update) => update.type === "impact")
                .map((update) => (
                  <div key={update.id} className="flex gap-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
                    <div className="mt-1">{update.icon}</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-100">{update.title}</h3>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {new Date(update.date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-neutral-400">{update.description}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}

