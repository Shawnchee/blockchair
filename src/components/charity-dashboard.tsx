"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharityGoalSuggestion } from "@/components/charity-goal-suggestion"
import { CharityStats } from "@/components/charity-stats"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type Charity = {
  id: number
  name: string
  category: string
  current_goal: number
  funds_raised: number
  description: string
  selected?: boolean
}

export function CharityDashboard() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedCharities, setSelectedCharities] = useState<Charity[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchCharities() {
      try {
        const { data, error } = await supabase.from("charity").select("*").order("name")

        if (error) throw error

        if (data) {
          setCharities(data.map((charity) => ({ ...charity, selected: false })))

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(data.map((charity) => charity.category)))
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Error fetching charities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCharities()
  }, [])

  const handleCheckboxChange = (id: number) => {
    setCharities((prev) =>
      prev.map((charity) => (charity.id === id ? { ...charity, selected: !charity.selected } : charity)),
    )
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleAnalyze = () => {
    const selected = charities.filter((charity) => charity.selected)
    setSelectedCharities(selected)

    if (selected.length > 0) {
      setAnalyzing(true)
      generateSuggestions(selected)
    }
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
        const response = await fetch("/api/suggest-goal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            charities: categorizedCharities[category],
          }),
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        results[category] = data.suggestedGoal
      }

      setSuggestions(results)
    } catch (error) {
      console.error("Error generating suggestions:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredCharities =
    activeTab === "all" ? charities : charities.filter((charity) => charity.category === activeTab)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Select Charities</CardTitle>
          <CardDescription>Choose the charities you want to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCharities.map((charity) => (
                  <div key={charity.id} className="flex items-start space-x-2">
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
                        {charity.category} • Current Goal: ${charity.current_goal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={!charities.some((c) => c.selected) || analyzing} className="w-full">
            {analyzing ? "Analyzing..." : "Analyze Selected Charities"}
          </Button>
        </CardFooter>
      </Card>

      <div className="md:col-span-1 space-y-6">
        {selectedCharities.length > 0 && <CharityStats charities={selectedCharities} />}

        {Object.keys(suggestions).length > 0 && <CharityGoalSuggestion suggestions={suggestions} />}
      </div>
    </div>
  )
}

