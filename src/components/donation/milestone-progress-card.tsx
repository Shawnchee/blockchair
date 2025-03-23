"use client"

import { useState } from "react"
import { Check, ChevronDown, ChevronUp, InfoIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MilestoneProps {
  milestones: {
    id: string
    milestone_name: string
    target_amount: number
    funds_raised: number
    status: "pending" | "completed"
  }[]
}

export default function MilestoneProgressCard({ milestones = [] }: MilestoneProps) {
  const [expandedMilestones, setExpandedMilestones] = useState(true)

  // If no milestones are provided, use sample data for demonstration
  const displayMilestones =
    milestones.length > 0
      ? milestones
      : [
          {
            id: "1",
            milestone_name: "Initial Funding Goal",
            target_amount: 2000,
            funds_raised: 2000,
            status: "completed",
          },
          {
            id: "2",
            milestone_name: "Educational Supplies",
            target_amount: 1500,
            funds_raised: 750,
            status: "pending",
          },
          {
            id: "3",
            milestone_name: "Community Center Renovation",
            target_amount: 5000,
            funds_raised: 1250,
            status: "pending",
          },
        ]

  // Calculate total target and raised amounts
  const totalTargetAmount = displayMilestones.reduce((sum, milestone) => sum + milestone.target_amount, 0)
  const totalRaisedAmount = displayMilestones.reduce((sum, milestone) => sum + milestone.funds_raised, 0)
  const overallProgressPercentage = Math.min(Math.round((totalRaisedAmount / totalTargetAmount) * 100), 100)

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Milestone Progress</CardTitle>
            <CardDescription>Transparent breakdown of funding goals and progress</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedMilestones(!expandedMilestones)}
            className="h-8 w-8 p-0"
          >
            {expandedMilestones ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="font-medium">
                ${totalRaisedAmount.toLocaleString()} of ${totalTargetAmount.toLocaleString()}
              </span>
            </div>
            <Progress value={overallProgressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{overallProgressPercentage}% Complete</span>
              <span>${(totalTargetAmount - totalRaisedAmount).toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Milestones List */}
          {expandedMilestones && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Funding Milestones</div>

              {displayMilestones.map((milestone) => {
                // Calculate progress percentage - handle the case where status is completed
                const progressPercentage =
                  milestone.status === "completed"
                    ? 100
                    : Math.min(Math.round((milestone.funds_raised / milestone.target_amount) * 100), 100)

                return (
                  <div key={milestone.id} className="space-y-2 rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{milestone.milestone_name}</span>
                        {milestone.status === "completed" && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Check className="mr-1 h-3 w-3" /> Achieved
                          </Badge>
                        )}
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <InfoIcon className="h-4 w-4" />
                              <span className="sr-only">More info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Funds will be released when this milestone is achieved</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <Progress value={progressPercentage} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{progressPercentage}% Complete</span>
                      <div className="font-medium">
                        ${milestone.funds_raised.toLocaleString()} / ${milestone.target_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

