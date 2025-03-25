"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { CharityInsights } from "@/components/charity-insights"
import { FundraisingGoalSuggestion } from "@/components/fundraising-goal-suggestion"
import { AlertCircle, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define types based on your actual database schema
type DonationRecord = {
  charityId: number
  name: string
  description: string
  focusAreas: string
  location: string
  mission: string
  donationMethods: string
  impact: string
  donorId: number
  donorName: string
  donorType: string
  donationAmount: number
  donationDate: string
  donationFrequency: string
  count: string
  selected?: boolean
}

// Derived charity type for our application
type Charity = {
  id: number
  name: string
  category: string // We'll use focusAreas as category
  rawCategory: string // Store the original category string
  current_goal?: number // We'll calculate this
  funds_raised: number // We'll calculate this from donationAmount
  description: string
  location: string
  mission: string
  donationMethods: string
  impact: string
  selected?: boolean
  donorCount: number
}

// List of categories that should bypass the API and use direct calculation
const BYPASS_API_CATEGORIES = [
  "Veterans",
  "Hunger",
  "Children",
  "Animal",
  "Mental",
  "Environmental",
  "Disability",
  "Senior",
]

export function CharityAnalysisDashboard() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [selectedCharities, setSelectedCharities] = useState<Charity[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  // Function to extract the first word/item from a category string
  const extractPrimaryCategory = (categoryString: string | null | undefined): string => {
    if (!categoryString) return "Uncategorized"

    try {
      // Try to parse as JSON if it looks like an array
      if (categoryString.trim().startsWith("[") && categoryString.includes(",")) {
        try {
          // First try to parse as JSON
          const parsed = JSON.parse(categoryString.replace(/'/g, '"'))
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0] || "Uncategorized"
          }
        } catch (e) {
          // If JSON parsing fails, try regex
          const arrayMatch = categoryString.match(/\[['"]?([^'"',]+)['"]?/)
          if (arrayMatch && arrayMatch[1]) {
            return arrayMatch[1].trim()
          }
        }
      }

      // If not in array format or parsing failed, just return the first word or the whole string if no spaces/commas
      return categoryString.split(/[,\s]/)[0].trim() || "Uncategorized"
    } catch (error) {
      console.error("Error extracting category:", error)
      return "Uncategorized"
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all donation records
        const { data, error } = await supabase.from("charity_donor").select("*")

        if (error) throw new Error(`Error fetching data: ${error.message}`)

        if (data && data.length > 0) {
          // Process the data to extract unique charities
          const donationRecords = data as DonationRecord[]

          // Group by charityId
          const charityMap = new Map<
            number,
            {
              records: DonationRecord[]
              totalDonation: number
              donorIds: Set<number>
            }
          >()

          donationRecords.forEach((record) => {
            const charityId = record.charityId || 0

            if (!charityMap.has(charityId)) {
              charityMap.set(charityId, {
                records: [],
                totalDonation: 0,
                donorIds: new Set(),
              })
            }

            const charityData = charityMap.get(charityId)!
            charityData.records.push(record)
            charityData.totalDonation += Number(record.donationAmount || 0)
            if (record.donorId) charityData.donorIds.add(record.donorId)
          })

          // Convert to our Charity type
          const processedCharities: Charity[] = Array.from(charityMap.entries()).map(([id, data]) => {
            // Use the first record for charity details
            const firstRecord = data.records[0]
            const rawCategory = firstRecord.focusAreas || "Uncategorized"
            const primaryCategory = extractPrimaryCategory(rawCategory)

            return {
              id,
              name: firstRecord.name || `Charity ${id}`,
              category: primaryCategory,
              rawCategory: rawCategory,
              funds_raised: data.totalDonation,
              // Estimate a goal based on donations (for example, 150% of current donations)
              current_goal: Math.round(data.totalDonation * 1.5),
              description: firstRecord.description || "",
              location: firstRecord.location || "",
              mission: firstRecord.mission || "",
              donationMethods: firstRecord.donationMethods || "",
              impact: firstRecord.impact || "",
              selected: false,
              donorCount: data.donorIds.size,
            }
          })

          setCharities(processedCharities)

          // Extract unique categories (primary categories only)
          const uniqueCategories = Array.from(new Set(processedCharities.map((charity) => charity.category))).filter(
            Boolean,
          )

          setCategories(uniqueCategories)
        } else {
          // No data found
          setError("No charity data found in the database.")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCheckboxChange = (id: number) => {
    setCharities((prev) =>
      prev.map((charity) => (charity.id === id ? { ...charity, selected: !charity.selected } : charity)),
    )
  }

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value)
  }

  const handleAnalyze = () => {
    const selected = charities.filter((charity) => charity.selected)
    setSelectedCharities(selected)
    setError(null)

    if (selected.length > 0) {
      setAnalyzing(true)
      generateSuggestions(selected)
    }
  }

  // Fallback function to calculate a suggested goal without API
  const calculateFallbackGoal = (charities: Charity[]) => {
    try {
      // Calculate average funds raised
      const totalRaised = charities.reduce((sum, c) => sum + Number(c.funds_raised || 0), 0)
      const avgRaised = totalRaised / charities.length || 10000 // Default if no data

      // Set goal to 150% of current funds raised, with minimum and maximum values
      return Math.max(
        Math.min(
          Math.round(avgRaised * 1.5),
          1000000, // Maximum $1M
        ),
        10000, // Minimum $10K
      )
    } catch (error) {
      console.error("Error in fallback calculation:", error)
      return 50000 // Default if all else fails
    }
  }

  // Check if a category should bypass the API
  const shouldBypassApi = (category: string): boolean => {
    return BYPASS_API_CATEGORIES.some((bypassCategory) => category.toLowerCase().includes(bypassCategory.toLowerCase()))
  }

  const generateSuggestions = async (selectedCharities: Charity[]) => {
    try {
      // Group charities by category
      const categorizedCharities: Record<string, Charity[]> = {}

      selectedCharities.forEach((charity) => {
        if (!categorizedCharities[charity.category]) {
          categorizedCharities[charity.category] = []
        }
        categorizedCharities[charity.category].push(charity)
      })

      // Call the API route for each category
      const results: Record<string, number> = {}

      for (const category in categorizedCharities) {
        const charitiesInCategory = categorizedCharities[category]

        try {
          console.log(`Processing category: ${category} with ${charitiesInCategory.length} charities`)

          // Check if this category should bypass the API
          if (shouldBypassApi(category)) {
            console.log(`Using direct calculation for ${category} category (bypassing API)`)
            results[category] = calculateFallbackGoal(charitiesInCategory)
            continue
          }

          // Try the API call with robust error handling
          try {
            const response = await fetch("/api/suggest-goal", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
                "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
                "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
              },
              body: JSON.stringify({
                category,
                charities: charitiesInCategory,
              }),
            })

            // Check if response is ok before trying to parse
            if (!response.ok) {
              console.log(`API returned status ${response.status} for ${category}, using fallback calculation`)
              results[category] = calculateFallbackGoal(charitiesInCategory)
              continue
            }

            // Get response text first for debugging
            const responseText = await response.text()

            // If response is empty or not JSON, use fallback
            if (!responseText || responseText.includes("Internal server error")) {
              console.log(`Empty or error response for ${category}, using fallback calculation`)
              results[category] = calculateFallbackGoal(charitiesInCategory)
              continue
            }

            // Try to parse the response as JSON
            let data
            try {
              data = JSON.parse(responseText)
            } catch (jsonError) {
              console.error(`Error parsing JSON response for ${category}:`, jsonError, "Response was:", responseText)
              results[category] = calculateFallbackGoal(charitiesInCategory)
              continue
            }

            // Check if we got a valid suggestedGoal
            if (data && typeof data.suggestedGoal === "number") {
              results[category] = data.suggestedGoal
            } else {
              console.error(`Invalid API response format for ${category}:`, data)
              results[category] = calculateFallbackGoal(charitiesInCategory)
            }
          } catch (apiError) {
            console.error(`API call failed for ${category}:`, apiError)
            results[category] = calculateFallbackGoal(charitiesInCategory)
          }
        } catch (categoryError) {
          console.error(`Error processing category ${category}:`, categoryError)
          results[category] = calculateFallbackGoal(charitiesInCategory)
        }
      }

      setSuggestions(results)
    } catch (error) {
      console.error("Error generating suggestions:", error)
      setError(error instanceof Error ? error.message : "Failed to generate suggestions")
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredCharities =
    activeCategory === "all" ? charities : charities.filter((charity) => charity.category === activeCategory)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Charities</CardTitle>
          <CardDescription>Choose the charities you want to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Category</span>
            </div>
            <Select value={activeCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              ))}
            </div>
          ) : filteredCharities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No charities found. Please check your database structure or select a different category.
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredCharities.map((charity) => (
                <div key={charity.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50">
                  <Checkbox
                    id={`charity-${charity.id}`}
                    checked={charity.selected}
                    onCheckedChange={() => handleCheckboxChange(charity.id)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor={`charity-${charity.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {charity.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {charity.category} • Funds Raised: ${charity.funds_raised.toLocaleString()} • Goal: $
                      {charity.current_goal?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={!charities.some((c) => c.selected) || analyzing} className="w-full">
            {analyzing ? "Analyzing..." : "Analyze Selected Charities"}
          </Button>
        </CardFooter>
      </Card>

      <div className="lg:col-span-1 space-y-6">
        {selectedCharities.length > 0 && <CharityInsights charities={selectedCharities} />}

        {Object.keys(suggestions).length > 0 && <FundraisingGoalSuggestion suggestions={suggestions} />}
      </div>
    </div>
  )
}

