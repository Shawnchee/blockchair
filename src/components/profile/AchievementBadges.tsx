"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Award, Heart, Calendar, Zap, TrendingUp, Target, Clock, Users, Sparkles } from "lucide-react"
import { formatEther } from "ethers"

interface AchievementBadgesProps {
  walletAddress: string
  ethToMyr: number
}

interface Achievement {
  id: string
  icon: React.ReactNode
  name: string
  description: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
  color: string
  date?: string
}

export default function AchievementBadges({ walletAddress, ethToMyr }: AchievementBadgesProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    async function fetchDonationData() {
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

        // Fetch charity data from Supabase
        const { data: charityData, error: charityError } = await supabase
          .from("charity_2")
          .select("id, title, categories, smart_contract_address")

        if (charityError) {
          throw new Error(`Failed to fetch charity data: ${charityError.message}`)
        }

        // Match transactions with charities
        const matchedDonations = donationTxs.filter((tx: any) =>
          charityData.some(
            (charity) => charity.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
          )
        )

        // Process donation data for achievements
        processAchievements(matchedDonations, charityData)
      } catch (err: any) {
        console.error("Error fetching donation data:", err)
        setError(err.message || "Failed to fetch donation data")
      } finally {
        setLoading(false)
      }
    }

    fetchDonationData()
  }, [walletAddress, ethToMyr])

  const processAchievements = (donations: any[], charities: any[]) => {
    // Initialize achievements
    const achievementsList: Achievement[] = [
      {
        id: "first_donation",
        icon: <Heart className="h-5 w-5" />,
        name: "First Steps",
        description: "Made your first donation",
        unlocked: false,
        color: "bg-pink-500"
      },
      {
        id: "donation_streak",
        icon: <Calendar className="h-5 w-5" />,
        name: "Consistent Giver",
        description: "Donated in consecutive months",
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        color: "bg-blue-500"
      },
      {
        id: "donation_amount",
        icon: <Zap className="h-5 w-5" />,
        name: "Generous Donor",
        description: "Donated at least 0.5 ETH in total",
        unlocked: false,
        progress: 0,
        maxProgress: 0.5,
        color: "bg-yellow-500"
      },
      {
        id: "diverse_causes",
        icon: <Users className="h-5 w-5" />,
        name: "Cause Explorer",
        description: "Donated to multiple different causes",
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        color: "bg-green-500"
      },
      {
        id: "large_donation",
        icon: <Target className="h-5 w-5" />,
        name: "Major Impact",
        description: "Made a single donation of at least 0.1 ETH",
        unlocked: false,
        color: "bg-purple-500"
      },
      {
        id: "donation_growth",
        icon: <TrendingUp className="h-5 w-5" />,
        name: "Growing Impact",
        description: "Increased donation amount month over month",
        unlocked: false,
        color: "bg-cyan-500"
      },
      {
        id: "night_owl",
        icon: <Clock className="h-5 w-5" />,
        name: "Night Owl",
        description: "Made a donation between midnight and 5 AM",
        unlocked: false,
        color: "bg-indigo-500"
      },
      {
        id: "early_supporter",
        icon: <Award className="h-5 w-5" />,
        name: "Early Supporter",
        description: "Among the first 100 donors on the platform",
        unlocked: false,
        color: "bg-amber-500"
      },
      {
        id: "blockchain_pioneer",
        icon: <Sparkles className="h-5 w-5" />,
        name: "Blockchain Pioneer",
        description: "Used blockchain for charitable giving",
        unlocked: true, // Everyone gets this one
        date: new Date().toLocaleDateString(),
        color: "bg-teal-500"
      }
    ]

    if (donations.length === 0) {
      setAchievements(achievementsList)
      return
    }

    // First donation achievement
    const firstDonation = donations.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp))[0]
    const firstDonationDate = new Date(parseInt(firstDonation.timeStamp) * 1000)
    achievementsList[0].unlocked = true
    achievementsList[0].date = firstDonationDate.toLocaleDateString()

    // Calculate total donation amount
    const totalEth = donations.reduce(
      (sum, tx) => sum + parseFloat(formatEther(tx.value)),
      0
    )
    
    // Donation amount achievement
    achievementsList[2].progress = totalEth
    achievementsList[2].unlocked = totalEth >= 0.5
    if (achievementsList[2].unlocked) {
      achievementsList[2].date = new Date().toLocaleDateString()
    }

    // Large single donation achievement
    const largestDonation = donations.reduce(
      (max, tx) => {
        const amount = parseFloat(formatEther(tx.value))
        return amount > max ? amount : max
      },
      0
    )
    achievementsList[4].unlocked = largestDonation >= 0.1
    if (achievementsList[4].unlocked) {
      achievementsList[4].date = new Date().toLocaleDateString()
    }

    // Night owl achievement
    const nightOwlDonation = donations.some(tx => {
      const date = new Date(parseInt(tx.timeStamp) * 1000)
      const hour = date.getHours()
      return hour >= 0 && hour < 5
    })
    achievementsList[6].unlocked = nightOwlDonation
    if (achievementsList[6].unlocked) {
      achievementsList[6].date = new Date().toLocaleDateString()
    }

    // Diverse causes achievement
    const donatedCauses = new Set<string>()
    donations.forEach(tx => {
      const charity = charities.find(
        c => c.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
      )
      if (charity && charity.categories) {
        charity.categories.forEach(category => donatedCauses.add(category))
      }
    })
    achievementsList[3].progress = donatedCauses.size
    achievementsList[3].unlocked = donatedCauses.size >= 3
    if (achievementsList[3].unlocked) {
      achievementsList[3].date = new Date().toLocaleDateString()
    }

    // Donation streak achievement
    const donationMonths = new Set<string>()
    donations.forEach(tx => {
      const date = new Date(parseInt(tx.timeStamp) * 1000)
      const monthYear = `${date.getMonth()}-${date.getFullYear()}`
      donationMonths.add(monthYear)
    })
    
    // Check for consecutive months
    const monthsArray = Array.from(donationMonths).map(my => {
      const [month, year] = my.split('-').map(Number)
      return { month, year }
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
    
    let maxStreak = 1
    let currentStreak = 1
    
    for (let i = 1; i < monthsArray.length; i++) {
      const prevDate = monthsArray[i-1]
      const currDate = monthsArray[i]
      
      const isConsecutive = 
        (currDate.month === prevDate.month + 1 && currDate.year === prevDate.year) ||
        (currDate.month === 0 && prevDate.month === 11 && currDate.year === prevDate.year + 1)
      
      if (isConsecutive) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }
    
    achievementsList[1].progress = maxStreak
    achievementsList[1].unlocked = maxStreak >= 3
    if (achievementsList[1].unlocked) {
      achievementsList[1].date = new Date().toLocaleDateString()
    }

    // Donation growth achievement
    const monthlyDonations = new Map<string, number>()
    donations.forEach(tx => {
      const date = new Date(parseInt(tx.timeStamp) * 1000)
      const monthYear = `${date.getMonth()}-${date.getFullYear()}`
      const amount = parseFloat(formatEther(tx.value))
      
      monthlyDonations.set(
        monthYear, 
        (monthlyDonations.get(monthYear) || 0) + amount
      )
    })
    
    const monthlyAmounts = Array.from(monthlyDonations.entries())
      .map(([monthYear, amount]) => {
        const [month, year] = monthYear.split('-').map(Number)
        return { month, year, amount }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
    
    let hasGrowth = false
    for (let i = 1; i < monthlyAmounts.length; i++) {
      if (monthlyAmounts[i].amount > monthlyAmounts[i-1].amount) {
        hasGrowth = true
        break
      }
    }
    
    achievementsList[5].unlocked = hasGrowth && monthlyAmounts.length >= 2
    if (achievementsList[5].unlocked) {
      achievementsList[5].date = new Date().toLocaleDateString()
    }

    // Early supporter achievement - this would typically be determined by the backend
    // For now, we'll just set it based on the timestamp of the first donation
    const earlyDate = new Date('2023-01-01').getTime() / 1000
    achievementsList[7].unlocked = parseInt(firstDonation.timeStamp) < earlyDate
    if (achievementsList[7].unlocked) {
      achievementsList[7].date = firstDonationDate.toLocaleDateString()
    }

    setAchievements(achievementsList)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-500" />
            <span>Donation Achievements</span>
          </CardTitle>
          <CardDescription>Unlock badges by reaching donation milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Error loading achievements: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-500" />
          <span>Donation Achievements</span>
        </CardTitle>
        <CardDescription>
          You've unlocked {unlockedCount} of {totalCount} achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <TooltipProvider key={achievement.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`relative flex flex-col items-center justify-center p-4 rounded-lg border ${
                      achievement.unlocked 
                        ? "border-teal-200 bg-teal-50" 
                        : "border-gray-200 bg-gray-50 opacity-60"
                    } hover:shadow-sm transition-all cursor-help`}
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-2 ${
                        achievement.unlocked ? achievement.color : "bg-gray-400"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <h3 className="text-sm font-medium text-center">{achievement.name}</h3>
                    
                    {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                      <div className="w-full mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${achievement.unlocked ? achievement.color : "bg-gray-400"}`}
                            style={{ width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {achievement.progress} / {achievement.maxProgress}
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlocked && achievement.date && (
                      <Badge 
                        variant="outline" 
                        className="absolute -top-2 -right-2 bg-white text-xs"
                      >
                        {achievement.date}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-2 max-w-xs">
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                  {achievement.unlocked ? (
                    <p className="text-xs text-teal-600 mt-1">Unlocked {achievement.date}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Not yet unlocked</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
