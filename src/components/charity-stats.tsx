"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Charity = {
  id: number
  name: string
  category: string
  current_goal: number
  funds_raised: number
  description: string
}

interface CharityStatsProps {
  charities: Charity[]
}

export function CharityStats({ charities }: CharityStatsProps) {
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalGoal: number; totalRaised: number }> = {}

    charities.forEach((charity) => {
      if (!stats[charity.category]) {
        stats[charity.category] = { count: 0, totalGoal: 0, totalRaised: 0 }
      }

      stats[charity.category].count += 1
      stats[charity.category].totalGoal += charity.current_goal
      stats[charity.category].totalRaised += charity.funds_raised
    })

    return Object.entries(stats).map(([category, data]) => ({
      category,
      count: data.count,
      totalGoal: data.totalGoal,
      totalRaised: data.totalRaised,
      avgGoal: Math.round(data.totalGoal / data.count),
      avgRaised: Math.round(data.totalRaised / data.count),
      successRate: Math.round((data.totalRaised / data.totalGoal) * 100),
    }))
  }, [charities])

  const chartData = useMemo(() => {
    return categoryStats.map((stat) => ({
      name: stat.category,
      "Avg Goal": stat.avgGoal,
      "Avg Raised": stat.avgRaised,
    }))
  }, [categoryStats])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Charities Statistics</CardTitle>
        <CardDescription>
          Overview of {charities.length} selected charities across {categoryStats.length} categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Avg Goal" fill="#8884d8" />
                <Bar dataKey="Avg Raised" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="rounded-lg border p-3">
                <h3 className="font-medium">{stat.category}</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Charities</p>
                    <p className="font-medium">{stat.count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{stat.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Goal</p>
                    <p className="font-medium">${stat.avgGoal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Raised</p>
                    <p className="font-medium">${stat.avgRaised.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

