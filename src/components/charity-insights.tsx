"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

type Charity = {
  id: number
  name: string
  category: string
  rawCategory?: string
  current_goal?: number
  funds_raised: number
  description: string
  location: string
  mission: string
  donationMethods: string
  impact: string
  donorCount: number
}

interface CharityInsightsProps {
  charities: Charity[]
}

export function CharityInsights({ charities }: CharityInsightsProps) {
  const categoryStats = useMemo(() => {
    const stats: Record<
      string,
      {
        count: number
        totalGoal: number
        totalRaised: number
        donorCount: number
      }
    > = {}

    charities.forEach((charity) => {
      if (!stats[charity.category]) {
        stats[charity.category] = {
          count: 0,
          totalGoal: 0,
          totalRaised: 0,
          donorCount: 0,
        }
      }

      stats[charity.category].count += 1
      stats[charity.category].totalGoal += charity.current_goal || 0
      stats[charity.category].totalRaised += charity.funds_raised || 0
      stats[charity.category].donorCount += charity.donorCount || 0
    })

    return Object.entries(stats).map(([category, data]) => ({
      category,
      count: data.count,
      totalGoal: data.totalGoal,
      totalRaised: data.totalRaised,
      donorCount: data.donorCount,
      avgGoal: data.totalGoal > 0 ? Math.round(data.totalGoal / data.count) : 0,
      avgRaised: Math.round(data.totalRaised / data.count),
      successRate: data.totalGoal > 0 ? Math.round((data.totalRaised / data.totalGoal) * 100) : 0,
      avgDonorsPerCharity: Math.round(data.donorCount / data.count),
    }))
  }, [charities])

  const chartData = useMemo(() => {
    return categoryStats.map((stat) => ({
      name: stat.category,
      "Avg Goal": stat.avgGoal,
      "Avg Raised": stat.avgRaised,
    }))
  }, [categoryStats])

  const pieData = useMemo(() => {
    return categoryStats.map((stat) => ({
      name: stat.category,
      value: stat.count,
    }))
  }, [categoryStats])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charity Insights</CardTitle>
        <CardDescription>
          Analysis of {charities.length} selected charities across {categoryStats.length} categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[200px]">
              <h3 className="text-sm font-medium mb-2">Fundraising by Category</h3>
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

            <div className="h-[200px]">
              <h3 className="text-sm font-medium mb-2">Charities by Category</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
                  {stat.donorCount > 0 && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Avg Donors per Charity</p>
                      <p className="font-medium">{stat.avgDonorsPerCharity}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

