"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface CharityGoalSuggestionProps {
  suggestions: Record<string, number>
}

export function CharityGoalSuggestion({ suggestions }: CharityGoalSuggestionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Goal Suggestions</CardTitle>
        <CardDescription>Recommended fundraising goals based on category analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(suggestions).map(([category, suggestedGoal]) => (
            <div key={category} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">{category}</h3>
                <p className="text-sm text-muted-foreground">Suggested fundraising goal</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${suggestedGoal.toLocaleString()}</p>
                <div className="flex items-center justify-end text-sm">
                  <SuggestionIndicator value={suggestedGoal} category={category} />
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">How these suggestions work:</p>
            <p className="mt-1 text-muted-foreground">
              Our AI analyzes historical fundraising data, success rates, and category trends to suggest optimal
              fundraising goals for each charity category.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SuggestionIndicator({ value, category }: { value: number; category: string }) {
  // This would normally compare to average goals in the database
  // For demo purposes, we're using some hardcoded comparisons
  const baselineGoals: Record<string, number> = {
    Education: 50000,
    Health: 75000,
    Environment: 40000,
    Poverty: 60000,
    "Animal Welfare": 35000,
    "Arts & Culture": 30000,
    "Disaster Relief": 100000,
    "Human Rights": 55000,
  }

  const baseline = baselineGoals[category] || 50000
  const percentDiff = ((value - baseline) / baseline) * 100

  if (Math.abs(percentDiff) < 5) {
    return (
      <span className="flex items-center text-muted-foreground">
        <Minus className="mr-1 h-3 w-3" />
        In line with category average
      </span>
    )
  }

  if (percentDiff > 0) {
    return (
      <span className="flex items-center text-green-600">
        <ArrowUp className="mr-1 h-3 w-3" />
        {Math.round(percentDiff)}% higher than average
      </span>
    )
  }

  return (
    <span className="flex items-center text-amber-600">
      <ArrowDown className="mr-1 h-3 w-3" />
      {Math.abs(Math.round(percentDiff))}% lower than average
    </span>
  )
}

