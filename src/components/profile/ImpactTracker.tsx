"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Heart, TreePine, Droplets, GraduationCap, Stethoscope, Users } from "lucide-react"
import supabase from "@/utils/supabase/client"
import { formatEther } from "ethers"

interface ImpactTrackerProps {
  walletAddress: string
  ethToMyr: number
}

interface ImpactMetric {
  icon: React.ReactNode
  title: string
  value: number
  unit: string
  description: string
  color: string
}

export default function ImpactTracker({ walletAddress, ethToMyr }: ImpactTrackerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalDonated, setTotalDonated] = useState(0)
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([])
  const [causeBreakdown, setCauseBreakdown] = useState<Record<string, number>>({})

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

        // Calculate total donated
        const totalEth = matchedDonations.reduce(
          (sum: number, tx: any) => sum + parseFloat(formatEther(tx.value)),
          0
        )
        setTotalDonated(totalEth)

        // Calculate cause breakdown
        const causes: Record<string, number> = {}
        
        matchedDonations.forEach((tx: any) => {
          const charity = charityData.find(
            (c) => c.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
          )
          
          if (charity && charity.categories) {
            charity.categories.forEach((category: string) => {
              const amount = parseFloat(formatEther(tx.value))
              causes[category] = (causes[category] || 0) + amount
            })
          }
        })
        
        setCauseBreakdown(causes)

        // Generate impact metrics based on donation amount and causes
        generateImpactMetrics(totalEth, causes)
      } catch (err: any) {
        console.error("Error fetching donation data:", err)
        setError(err.message || "Failed to fetch donation data")
      } finally {
        setLoading(false)
      }
    }

    fetchDonationData()
  }, [walletAddress, ethToMyr])

  const generateImpactMetrics = (totalEth: number, causes: Record<string, number>) => {
    const metrics: ImpactMetric[] = []
    const totalMyr = totalEth * ethToMyr

    // Education impact
    if (causes["Education"]) {
      const educationAmount = causes["Education"]
      const studentsHelped = Math.floor(educationAmount * ethToMyr / 250) // Approx. cost per student
      
      metrics.push({
        icon: <GraduationCap className="h-8 w-8" />,
        title: "Students Supported",
        value: studentsHelped,
        unit: "students",
        description: "Estimated number of students provided with educational resources",
        color: "bg-blue-500"
      })
    }

    // Healthcare impact
    if (causes["Healthcare"]) {
      const healthcareAmount = causes["Healthcare"]
      const patientsHelped = Math.floor(healthcareAmount * ethToMyr / 300) // Approx. cost per patient
      
      metrics.push({
        icon: <Stethoscope className="h-8 w-8" />,
        title: "Medical Treatments",
        value: patientsHelped,
        unit: "treatments",
        description: "Estimated number of medical treatments funded",
        color: "bg-red-500"
      })
    }

    // Environment impact
    if (causes["Environment"]) {
      const environmentAmount = causes["Environment"]
      const treesPlanted = Math.floor(environmentAmount * ethToMyr / 25) // Approx. cost per tree
      
      metrics.push({
        icon: <TreePine className="h-8 w-8" />,
        title: "Trees Planted",
        value: treesPlanted,
        unit: "trees",
        description: "Estimated number of trees planted through environmental initiatives",
        color: "bg-green-500"
      })
    }

    // Water impact (if applicable)
    if (causes["Water"] || causes["Environment"]) {
      const waterAmount = (causes["Water"] || 0) + ((causes["Environment"] || 0) * 0.3)
      const waterLiters = Math.floor(waterAmount * ethToMyr * 100) // Approx. liters of clean water
      
      metrics.push({
        icon: <Droplets className="h-8 w-8" />,
        title: "Clean Water",
        value: waterLiters,
        unit: "liters",
        description: "Estimated amount of clean water provided to communities",
        color: "bg-cyan-500"
      })
    }

    // General impact for all donations
    const peopleImpacted = Math.floor(totalMyr / 100) // Approx. cost per person impacted
    
    metrics.push({
      icon: <Users className="h-8 w-8" />,
      title: "Lives Impacted",
      value: peopleImpacted,
      unit: "people",
      description: "Estimated number of people positively impacted by your donations",
      color: "bg-purple-500"
    })

    // Add a general metric for all donations
    metrics.push({
      icon: <Heart className="h-8 w-8" />,
      title: "Community Support",
      value: Math.floor(totalMyr / 1000),
      unit: "communities",
      description: "Estimated number of communities supported through your generosity",
      color: "bg-pink-500"
    })

    setImpactMetrics(metrics)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
            <Heart className="h-5 w-5 text-teal-500" />
            <span>Your Donation Impact</span>
          </CardTitle>
          <CardDescription>See the real-world impact of your donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Error loading impact data: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (totalDonated === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-teal-500" />
            <span>Your Donation Impact</span>
          </CardTitle>
          <CardDescription>See the real-world impact of your donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-teal-50 p-4 rounded-md text-teal-800">
            <p>
              No donation transactions found. Make your first donation to see your impact!
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
          <Heart className="h-5 w-5 text-teal-500" />
          <span>Your Donation Impact</span>
        </CardTitle>
        <CardDescription>
          See the real-world difference your donations have made
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Total Impact from {totalDonated.toFixed(4)} ETH donated</h3>
          <Progress value={100} className="h-2 bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {impactMetrics.map((metric, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`${metric.color} p-4 text-white flex items-center justify-between`}>
                <div className="font-medium">{metric.title}</div>
                {metric.icon}
              </div>
              <div className="p-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-800">{metric.value.toLocaleString()}</span>
                  <span className="ml-1 text-gray-500 text-sm">{metric.unit}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-teal-50 p-4 rounded-md text-sm text-teal-800">
          <p className="flex items-center">
            <Heart className="h-4 w-4 mr-2 text-teal-600" />
            <span>
              These impact estimates are based on average costs and typical outcomes from charitable projects.
              Actual impact may vary based on specific projects and implementation.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
