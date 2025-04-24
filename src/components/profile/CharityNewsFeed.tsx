"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Newspaper, ExternalLink, Calendar, MessageSquare, Heart, RefreshCw } from "lucide-react"
import supabase from "@/utils/supabase/client"
import Link from "next/link"

interface CharityNewsFeedProps {
  walletAddress: string
}

interface NewsItem {
  id: string
  charity_id: string
  title: string
  content: string
  date: string
  image_url?: string
  charity_name: string
  charity_logo?: string
  categories: string[]
  type: "update" | "impact" | "event" | "thank_you"
}

export default function CharityNewsFeed({ walletAddress }: CharityNewsFeedProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [supportedCharities, setSupportedCharities] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all")

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
          .select("id, title, smart_contract_address, categories, cover_image")

        if (charityError) {
          throw new Error(`Failed to fetch charity data: ${charityError.message}`)
        }

        // Match transactions with charities to find supported charities
        const charityIds: string[] = []
        
        donationTxs.forEach((tx: any) => {
          const charity = charityData.find(
            (c) => c.smart_contract_address?.toLowerCase() === tx.to?.toLowerCase()
          )
          if (charity && !charityIds.includes(charity.id)) {
            charityIds.push(charity.id)
          }
        })
        
        setSupportedCharities(charityIds)

        // For demo purposes, we'll generate mock news items
        // In a real app, you would fetch this from your backend
        if (charityIds.length > 0) {
          const mockNewsItems = generateMockNewsItems(charityIds, charityData)
          setNewsItems(mockNewsItems)
        }
      } catch (err: any) {
        console.error("Error fetching donation data:", err)
        setError(err.message || "Failed to fetch donation data")
      } finally {
        setLoading(false)
      }
    }

    fetchDonationData()
  }, [walletAddress])

  const generateMockNewsItems = (charityIds: string[], charityData: any[]): NewsItem[] => {
    const newsTypes = ["update", "impact", "event", "thank_you"]
    const mockNews: NewsItem[] = []
    
    // Generate 2-3 news items per supported charity
    charityIds.forEach(charityId => {
      const charity = charityData.find(c => c.id === charityId)
      if (!charity) return
      
      const numItems = 2 + Math.floor(Math.random() * 2) // 2-3 items
      
      for (let i = 0; i < numItems; i++) {
        const type = newsTypes[Math.floor(Math.random() * newsTypes.length)] as "update" | "impact" | "event" | "thank_you"
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)) // Random date in the last 30 days
        
        let title = ""
        let content = ""
        
        switch (type) {
          case "update":
            title = `Project Update: ${charity.title}`
            content = `We've made significant progress on our ${charity.title} initiative. Thanks to donors like you, we've been able to expand our reach and impact more lives.`
            break
          case "impact":
            title = `Impact Report: ${charity.categories[0] || "Project"} Success`
            content = `Your donation to ${charity.title} has helped us achieve remarkable results. We've reached more beneficiaries than ever before and the feedback has been overwhelmingly positive.`
            break
          case "event":
            title = `Upcoming Event: ${charity.categories[0] || "Community"} Gathering`
            content = `Join us for a special event to celebrate the success of our ${charity.title} project. Meet the team, see the impact firsthand, and connect with other supporters.`
            break
          case "thank_you":
            title = `Thank You from ${charity.title}`
            content = `We want to express our deepest gratitude for your generous support. Your contribution to ${charity.title} has made a real difference in the lives of those we serve.`
            break
        }
        
        mockNews.push({
          id: `news-${charityId}-${i}`,
          charity_id: charityId,
          title,
          content,
          date: date.toISOString(),
          image_url: charity.cover_image,
          charity_name: charity.title,
          charity_logo: charity.cover_image,
          categories: charity.categories || [],
          type
        })
      }
    })
    
    // Sort by date (newest first)
    return mockNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredNews = activeFilter === "all" 
    ? newsItems 
    : newsItems.filter(item => item.type === activeFilter)

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-teal-500" />
            <span>Charity News Feed</span>
          </CardTitle>
          <CardDescription>Updates from charities you've supported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Error loading news feed: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (supportedCharities.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-teal-500" />
            <span>Charity News Feed</span>
          </CardTitle>
          <CardDescription>Updates from charities you've supported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-teal-50 p-4 rounded-md text-teal-800">
            <p>
              You haven't supported any charities yet. Make a donation to see updates from the projects you care about!
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
          <Newspaper className="h-5 w-5 text-teal-500" />
          <span>Charity News Feed</span>
        </CardTitle>
        <CardDescription>
          Stay updated with the latest news from charities you've supported
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveFilter}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" className="text-sm">All Updates</TabsTrigger>
              <TabsTrigger value="update" className="text-sm">Project Updates</TabsTrigger>
              <TabsTrigger value="impact" className="text-sm">Impact Reports</TabsTrigger>
              <TabsTrigger value="event" className="text-sm">Events</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {renderNewsList(filteredNews)}
          </TabsContent>
          <TabsContent value="update" className="mt-0">
            {renderNewsList(filteredNews)}
          </TabsContent>
          <TabsContent value="impact" className="mt-0">
            {renderNewsList(filteredNews)}
          </TabsContent>
          <TabsContent value="event" className="mt-0">
            {renderNewsList(filteredNews)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  function renderNewsList(news: NewsItem[]) {
    if (news.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No updates available in this category</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {news.map((item) => (
          <div 
            key={item.id} 
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              {item.image_url && (
                <div className="md:w-1/4 h-40 md:h-auto overflow-hidden bg-gray-100">
                  <img 
                    src={item.image_url} 
                    alt={item.charity_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`p-4 ${item.image_url ? 'md:w-3/4' : 'w-full'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <span className="font-medium text-teal-700">{item.charity_name}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    className={`
                      ${item.type === 'update' ? 'bg-blue-100 text-blue-800' : ''}
                      ${item.type === 'impact' ? 'bg-green-100 text-green-800' : ''}
                      ${item.type === 'event' ? 'bg-purple-100 text-purple-800' : ''}
                      ${item.type === 'thank_you' ? 'bg-pink-100 text-pink-800' : ''}
                    `}
                  >
                    {item.type === 'update' && 'Project Update'}
                    {item.type === 'impact' && 'Impact Report'}
                    {item.type === 'event' && 'Event'}
                    {item.type === 'thank_you' && 'Thank You'}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{item.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.slice(0, 2).map((category, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800"
                      >
                        {category}
                      </span>
                    ))}
                    {item.categories.length > 2 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        +{item.categories.length - 2} more
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>Comment</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>Like</span>
                    </Button>
                    <Link href={`/charity/browse-projects/${item.charity_id}`} passHref>
                      <Button variant="outline" size="sm" className="h-8">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <span>View Project</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
