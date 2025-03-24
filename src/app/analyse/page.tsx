import { CharityAnalysisDashboard } from "@/components/charity-analysis-dashboard"

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen pt-24 pb-8 px-4 flex flex-col max-w-6xl">    
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg p-8 mb-8 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-white my-8">Charity Fundraising Analysis</h1>
        <p className="text-xl text-white/90 max-w-2xl">
          Select charities to analyze and get AI-powered fundraising goal suggestions
        </p>
        </div>
        <CharityAnalysisDashboard />
    </div>
  )
}

