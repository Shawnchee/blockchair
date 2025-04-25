"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Award, Gift, Trophy, Star, Crown, Sparkles, Rocket, Target } from "lucide-react"
import { motion } from "framer-motion"
import supabase from "@/utils/supabase/client"

interface MilestoneRewardsProps {
  walletAddress: string
  ethToMyr: number
}

interface Milestone {
  id: string
  icon: React.ReactNode
  name: string
  description: string
  threshold: number
  reward: string
  unlocked: boolean
  color: string
}

export default function MilestoneRewards({ walletAddress, ethToMyr }: MilestoneRewardsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalDonated, setTotalDonated] = useState(0)
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    async function fetchDonationData() {
      if (!walletAddress) return

      try {
        setLoading(true)
        setError(null)

        // Fetch user data from Supabase
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("amount_eth_donated")
          .eq("wallet_address", walletAddress)
          .single()

        if (userError) {
          throw new Error(`Failed to fetch user data: ${userError.message}`)
        }

        const amountDonated = userData?.amount_eth_donated || 0
        setTotalDonated(amountDonated)

        // Define milestones
        const milestonesList: Milestone[] = [
          {
            id: "bronze",
            icon: <Award className="h-6 w-6" />,
            name: "Bronze Supporter",
            description: "Donate at least 0.1 ETH to unlock",
            threshold: 0.1,
            reward: "Bronze donor badge on your profile",
            unlocked: amountDonated >= 0.1,
            color: "bg-amber-700"
          },
          {
            id: "silver",
            icon: <Trophy className="h-6 w-6" />,
            name: "Silver Champion",
            description: "Donate at least 1 ETH to unlock",
            threshold: 1,
            reward: "Silver donor badge and priority support",
            unlocked: amountDonated >= 1,
            color: "bg-gray-400"
          },
          {
            id: "gold",
            icon: <Star className="h-6 w-6" />,
            name: "Gold Benefactor",
            description: "Donate at least 5 ETH to unlock",
            threshold: 5,
            reward: "Gold donor badge and exclusive updates",
            unlocked: amountDonated >= 5,
            color: "bg-yellow-500"
          },
          {
            id: "platinum",
            icon: <Crown className="h-6 w-6" />,
            name: "Platinum Philanthropist",
            description: "Donate at least 10 ETH to unlock",
            threshold: 10,
            reward: "Platinum donor badge and personalized impact reports",
            unlocked: amountDonated >= 10,
            color: "bg-indigo-500"
          },
          {
            id: "diamond",
            icon: <Sparkles className="h-6 w-6" />,
            name: "Diamond Visionary",
            description: "Donate at least 20 ETH to unlock",
            threshold: 20,
            reward: "Diamond donor badge and invitation to exclusive events",
            unlocked: amountDonated >= 20,
            color: "bg-cyan-500"
          }
        ]

        setMilestones(milestonesList)
      } catch (err: any) {
        console.error("Error fetching donation data:", err)
        setError(err.message || "Failed to fetch donation data")
      } finally {
        setLoading(false)
      }
    }

    fetchDonationData()
  }, [walletAddress, ethToMyr])

  // Find the next milestone to achieve
  const getNextMilestone = () => {
    const nextMilestone = milestones.find(milestone => !milestone.unlocked)
    return nextMilestone
  }

  const nextMilestone = getNextMilestone()
  const unlockedCount = milestones.filter(m => m.unlocked).length
  const totalCount = milestones.length

  if (loading) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-teal-500" />
            <span>Milestone Rewards</span>
          </CardTitle>
          <CardDescription>Unlock rewards by reaching donation milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-teal-100 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-teal-100 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-teal-100 rounded"></div>
                  <div className="h-4 bg-teal-100 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-teal-500" />
            <span>Milestone Rewards</span>
          </CardTitle>
          <CardDescription>Unlock rewards by reaching donation milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Error loading milestone rewards: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-teal-500" />
          <span>Milestone Rewards</span>
        </CardTitle>
        <CardDescription>
          You've unlocked {unlockedCount} of {totalCount} milestone rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        {nextMilestone && (
          <div className="mb-6 bg-teal-50 p-4 rounded-lg border border-teal-100">
            <h3 className="text-lg font-medium text-teal-800 mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-600" />
              <span>Next Milestone: {nextMilestone.name}</span>
            </h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-teal-700 mb-1">
                <span>{totalDonated.toFixed(2)} ETH</span>
                <span>{nextMilestone.threshold} ETH</span>
              </div>
              <Progress 
                value={(totalDonated / nextMilestone.threshold) * 100} 
                className="h-2" 
              />
            </div>
            <p className="text-sm text-teal-600">
              Donate {(nextMilestone.threshold - totalDonated).toFixed(2)} ETH more to unlock {nextMilestone.name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`relative flex flex-col items-center justify-center p-4 rounded-lg border ${
                        milestone.unlocked 
                          ? "border-teal-200 bg-teal-50" 
                          : "border-gray-200 bg-gray-50 opacity-60"
                      } hover:shadow-sm transition-all cursor-help h-full`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-3 ${
                          milestone.unlocked ? milestone.color : "bg-gray-300"
                        }`}
                      >
                        {milestone.icon}
                      </div>
                      <h3 className="text-sm font-medium text-center mb-1">{milestone.name}</h3>
                      <p className="text-xs text-gray-500 text-center">{milestone.description}</p>
                      
                      {milestone.unlocked && (
                        <Badge 
                          className="absolute -top-2 -right-2 bg-green-100 text-green-800 border-green-200"
                        >
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-3 max-w-xs">
                    <p className="font-medium">{milestone.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium">Reward:</p>
                      <p className="text-xs text-teal-600">{milestone.reward}</p>
                    </div>
                    {milestone.unlocked ? (
                      <p className="text-xs text-green-600 mt-2">You've unlocked this milestone!</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">
                        {(milestone.threshold - totalDonated).toFixed(2)} ETH more to unlock
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
