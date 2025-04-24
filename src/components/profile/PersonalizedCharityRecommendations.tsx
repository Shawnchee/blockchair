"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, Globe, ArrowRight, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import supabase from "@/utils/supabase/client"
import Link from "next/link"

interface Charity {
  id: number
  name: string
  category: string
  description: string
  funds_raised: number
  location: string
  match_score: number
  image_url?: string
}

export default function PersonalizedCharityRecommendations({ walletAddress }: { walletAddress: string }) {
  const [recommendations, setRecommendations] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])
  const [hoveredCharity, setHoveredCharity] = useState<number | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      if (!walletAddress) return

      try {
        setLoading(true)
        
        // Fetch charity data from Supabase
        const { data: charities, error } = await supabase
          .from('charity_2')
          .select('*')
          .limit(10)
        
        if (error) {
          console.error("Error fetching charity data:", error)
          return
        }

        // Transform the data and add match scores
        const transformedCharities = charities.map((charity: any) => ({
          id: charity.id,
          name: charity.name,
          category: charity.category || "General",
          description: charity.description || "Support this worthy cause",
          funds_raised: charity.funds_raised || 0,
          location: charity.location || "Global",
          match_score: Math.floor(Math.random() * 40) + 60, // 60-99% match for demo
          image_url: charity.image_url || "/placeholder-charity.jpg"
        }))

        // Sort by match score
        transformedCharities.sort((a, b) => b.match_score - a.match_score)
        
        setRecommendations(transformedCharities)
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(transformedCharities.map(charity => charity.category))
        )
        setCategories(["all", ...uniqueCategories])
      } catch (error) {
        console.error("Error in fetchRecommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [walletAddress])

  const filteredRecommendations = activeCategory === "all" 
    ? recommendations 
    : recommendations.filter(charity => charity.category === activeCategory)

  if (loading) {
    return (
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-teal-800 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-teal-600" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Loading your personalized charity recommendations...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-teal-800 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-teal-600" />
          Personalized Recommendations
        </CardTitle>
        <CardDescription>
          Charities that match your donation history and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                onClick={() => setActiveCategory(category)}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommendations.map((charity, index) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onHoverStart={() => setHoveredCharity(charity.id)}
                  onHoverEnd={() => setHoveredCharity(null)}
                  className="relative overflow-hidden rounded-lg border border-teal-100 bg-white shadow-sm"
                >
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-teal-600">
                      {charity.match_score}% Match
                    </Badge>
                  </div>
                  
                  <div className="h-32 bg-teal-100 relative overflow-hidden">
                    {charity.image_url && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${charity.image_url})` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white">
                      <Badge className="bg-white/20 text-white backdrop-blur-sm">
                        {charity.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-teal-800 mb-1">{charity.name}</h3>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Globe className="h-3 w-3 mr-1" />
                      <span>{charity.location}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {charity.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-teal-700">
                        {charity.funds_raised.toLocaleString()} MYR raised
                      </div>
                      <Link href={`/charity/${charity.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <span>Donate</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {hoveredCharity === charity.id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500 to-teal-500/80 text-white p-2 text-xs flex items-center justify-center"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>Recommended based on your donation history</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t border-teal-100 bg-teal-50/50 flex justify-between">
        <div className="text-sm text-teal-700 flex items-center">
          <Heart className="h-4 w-4 mr-1 text-teal-600" />
          <span>Recommendations are personalized based on your donation history</span>
        </div>
        <Button variant="link" className="text-teal-700">
          View All
        </Button>
      </CardFooter>
    </Card>
  )
}
