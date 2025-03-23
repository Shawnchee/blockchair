import { CharityAnalysisDashboard } from "@/components/charity-analysis-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen pt-24 pb-8 bg-background">
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-2">Charity Fundraising Analysis</h1>
        <p className="text-muted-foreground mb-8">
          Select charities to analyze and get AI-powered fundraising goal suggestions
        </p>
        <CharityAnalysisDashboard />
      </div>
    </div>
  )
}

