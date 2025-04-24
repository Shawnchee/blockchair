"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Sparkles, ExternalLink, Lightbulb } from "lucide-react"
import supabase from "@/utils/supabase/client"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Charity {
  id: string
  title: string
  categories: string[]
  introduction: string
  cover_image: string
  smart_contract_address: string
  recommendation_reason?: string
}

interface RecommendationProps {
  walletAddress: string
}

export default function PersonalizedRecommendations({ walletAddress }: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<Charity[]>([])
  const [userCauses, setUserCauses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserDonationData() {
      if (!walletAddress) return

      try {
        setLoading(true)
        setError(null)

        // Step 1: Fetch user's donation transactions
        const url = `/api/transactions?address=${walletAddress}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.status !== "1" || !data.result) {
          throw new Error(data.message || "Failed to fetch transaction data")
        }

        // Filter outgoing transactions
        const sentTransactions = data.result.filter(
          (tx: any) => tx.from.toLowerCase() === walletAddress.toLowerCase()
        )

        // Step 2: Fetch all charity data from Supabase
        const { data: allCharityData, error: charityError } = await supabase
          .from("charity_2")
          .select("id, title, categories, introduction, cover_image, smart_contract_address")

        if (charityError) {
          throw new Error(`Failed to fetch charity data: ${charityError.message}`)
        }

        // Step 3: Match transactions with charities to find user's donated charities
        const userDonatedCharities: Charity[] = []
        const donatedCharityIds = new Set<string>()

        for (const tx of sentTransactions) {
          const charity = allCharityData.find(
            (c) => c.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
          )
          if (charity && !donatedCharityIds.has(charity.id)) {
            userDonatedCharities.push(charity)
            donatedCharityIds.add(charity.id)
          }
        }

        // Extract causes from user's donations
        const causes = new Set<string>()
        userDonatedCharities.forEach((charity) => {
          if (charity.categories) {
            charity.categories.forEach((category: string) => causes.add(category))
          }
        })

        setUserCauses(Array.from(causes))

        // Step 4: Use OpenAI to generate personalized recommendations
        if (causes.size > 0 && userDonatedCharities.length > 0) {
          // Call our personalized recommendations API
          const aiResponse = await fetch('/api/personalizedRecommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userDonations: userDonatedCharities,
              allCharities: allCharityData
            })
          })

          if (!aiResponse.ok) {
            throw new Error(`AI recommendation request failed with status ${aiResponse.status}`)
          }

          const aiData = await aiResponse.json()

          if (aiData.recommendations && aiData.recommendations.length > 0) {
            setRecommendations(aiData.recommendations.slice(0, 3))
          } else {
            // Fallback to simple category matching if AI recommendations fail
            const filteredRecommendations = allCharityData.filter(
              (charity) =>
                !donatedCharityIds.has(charity.id) &&
                charity.categories?.some(cat => causes.has(cat))
            )
            setRecommendations(filteredRecommendations.slice(0, 3))
          }
        }
      } catch (err: any) {
        console.error("Error fetching recommendations:", err)
        setError(err.message || "Failed to fetch recommendations")
      } finally {
        setLoading(false)
      }
    }

    fetchUserDonationData()
  }, [walletAddress])

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            <span>Personalized Recommendations</span>
          </CardTitle>
          <CardDescription>Loading your personalized charity recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-40 w-full rounded-lg bg-teal-100" />
                <Skeleton className="h-4 w-3/4 bg-teal-100" />
                <Skeleton className="h-3 w-full bg-teal-100" />
                <Skeleton className="h-3 w-full bg-teal-100" />
                <Skeleton className="h-8 w-28 mt-2 bg-teal-100" />
              </div>
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
            <Sparkles className="h-5 w-5 text-teal-500" />
            <span>Personalized Recommendations</span>
          </CardTitle>
          <CardDescription>Based on your donation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Error loading recommendations: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            <span>Personalized Recommendations</span>
          </CardTitle>
          <CardDescription>Based on your donation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-teal-50 p-4 rounded-md text-teal-800">
            {userCauses.length > 0 ? (
              <p>
                We don't have any new recommendations based on your interests in{" "}
                {userCauses.join(", ")} at the moment. Check back later!
              </p>
            ) : (
              <p>
                Make your first donation to receive personalized charity recommendations based on your interests!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-500" />
          <span>Personalized Recommendations</span>
        </CardTitle>
        <CardDescription>
          Based on your interest in {userCauses.join(", ")}, you might like these projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((charity) => (
            <div
              key={charity.id}
              className="flex flex-col overflow-hidden rounded-lg border border-teal-100 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden bg-teal-50">
                {charity.cover_image ? (
                  <img
                    src={charity.cover_image}
                    alt={charity.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-teal-400 to-teal-500">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                )}
                {charity.recommendation_reason && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm cursor-help">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-white p-2 text-sm">
                        <p>{charity.recommendation_reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 font-medium text-gray-900">{charity.title}</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {charity.categories?.map((category, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-600">
                  {charity.introduction?.substring(0, 120) || "Support this worthy cause"}...
                </p>
                <Link href={`/charity/browse-projects/${charity.id}`} passHref>
                  <Button className="mt-3 w-full bg-teal-600 hover:bg-teal-700 text-white">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
