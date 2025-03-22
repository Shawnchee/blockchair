"use client"
import { useState, useCallback, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import type React from "react"

interface CharityMatch {
  match_type: string // "category", "description", or "both"
  match_strength: number // 0-1 value
}

interface Charity {
  charityId: number
  name: string
  description: string
  focus_areas: string[]
  relevance_score: number
  match_details: CharityMatch
  website?: string // Added website field
}

// Debounce function to limit API calls
function useDebounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

function CharitySearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Charity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCharity, setExpandedCharity] = useState<number | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([
    "Education",
    "Environment",
    "Healthcare",
    "Poverty",
    "Animal Welfare",
    "Human Rights",
    "Arts",
    "Disaster Relief",
    "Children",
    "Veterans",
  ])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"relevance" | "alphabetical">("relevance")

  // Memoized search function
  const fetchResults = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`http://127.0.0.1:5000/predict?query=${encodeURIComponent(searchQuery)}`)
        if (!response.ok) throw new Error("Network response was not ok")
        const data: Charity[] = await response.json()
        setResults(data)

        // Save to search history if not already there
        if (!searchHistory.includes(searchQuery)) {
          setSearchHistory((prev) => [searchQuery, ...prev].slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch charity recommendations. Please try again.")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [searchHistory],
  )

  // Update focus areas based on results
  useEffect(() => {
    if (results.length > 0) {
      const allAreas = results.flatMap((charity) => charity.focus_areas)
      const uniqueAreas = [...new Set(allAreas)]
      // Only use as filters if we have multiple areas
      if (uniqueAreas.length > 1) {
        // Keep current filters if they still exist in the results
        setActiveFilters((prev) => prev.filter((filter) => uniqueAreas.includes(filter)))
      }
    }
  }, [results])

  // Debounced search handler - only triggers after 300ms of inactivity
  const debouncedSearch = useDebounce(() => {
    if (query.trim().length >= 2) {
      fetchResults(query)
    }
  }, 300)

  // Handler for search button click
  const handleSearch = () => {
    if (query.trim()) {
      fetchResults(query)
    }
  }

  // Get badge color based on match type
  const getMatchBadgeColor = (matchType: string) => {
    switch (matchType) {
      case "both":
        return "bg-purple-100 text-purple-800"
      case "category":
        return "bg-blue-100 text-blue-800"
      case "description":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get human-readable match type label
  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case "both":
        return "Category & Description"
      case "category":
        return "Category Match"
      case "description":
        return "Description Match"
      default:
        return "Match"
    }
  }

  // Update the handleWebsiteClick function to better handle the website URLs from your database
  const handleWebsiteClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation()

    // If no URL is provided, don't do anything
    if (!url) return

    // Add https:// if not already present
    let fullUrl = url
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = `https://${url}`
    }

    window.open(fullUrl, "_blank", "noopener,noreferrer")
  }

  // Filter results based on active filters
  const filteredResults = results.filter(
    (charity) => activeFilters.length === 0 || charity.focus_areas.some((area) => activeFilters.includes(area)),
  )

  // Sort results based on current sort option
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name)
    }
    return b.relevance_score - a.relevance_score
  })

  // Get all unique focus areas from results
  const allFocusAreas = [...new Set(results.flatMap((charity) => charity.focus_areas))]

  // Toggle a filter
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  // Apply a suggested term
  const applySuggestedTerm = (term: string) => {
    setQuery(term)
    fetchResults(term)
  }

  // Toggle expanded view for a charity
  const toggleExpanded = (charityId: number) => {
    setExpandedCharity((prev) => (prev === charityId ? null : charityId))
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([])
  }

  // Format website URL for display
  const formatWebsiteUrl = (url?: string) => {
    if (!url) return ""
    // Remove protocol
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "")
  }

  return (
    <div className="container w-full p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4">Find Your Cause</h2>

      {/* Search input and button */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Enter a cause (e.g., education, environment, health)"
            className="w-full p-3 border rounded-md"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              debouncedSearch()
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setQuery("")}>
              ✕
            </button>
          )}
        </div>
        <button
          className="md:w-auto w-full bg-black text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Find Charities"}
        </button>
      </div>

      {/* Suggested search terms */}
      {suggestedTerms.length > 0 && !results.length && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Suggested searches:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTerms.map((term, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                onClick={() => applySuggestedTerm(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent searches */}
      {searchHistory.length > 0 && !results.length && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                className="px-3 py-1 border border-gray-200 hover:border-gray-300 rounded-full text-sm flex items-center gap-1 transition-colors"
                onClick={() => applySuggestedTerm(term)}
              >
                <span>🕒</span> {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">{error}</div>}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-blue-100 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-blue-100 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-blue-100 rounded"></div>
                <div className="h-4 bg-blue-100 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results section */}
      {results.length > 0 && !isLoading && (
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold">
              Found {sortedResults.length} Recommended Charities
              {activeFilters.length > 0 && ` (Filtered: ${activeFilters.length})`}
            </h3>

            {/* Controls: filter, sort, view mode */}
            <div className="flex flex-wrap gap-2">
              {/* Sort control */}
              <select
                className="p-2 border rounded text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "relevance" | "alphabetical")}
              >
                <option value="relevance">Sort by relevance</option>
                <option value="alphabetical">Sort alphabetically</option>
              </select>

              {/* View mode toggle */}
              <div className="flex border rounded overflow-hidden">
                <button
                  className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white"}`}
                  onClick={() => setViewMode("list")}
                >
                  List
                </button>
                <button
                  className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white"}`}
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Focus area filters */}
          {allFocusAreas.length > 1 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-500">Filter by focus area:</p>
                {activeFilters.length > 0 && (
                  <button className="text-xs text-blue-600 hover:text-blue-800" onClick={clearFilters}>
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allFocusAreas.map((area, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeFilters.includes(area)
                        ? "bg-blue-100 text-blue-800 border-blue-200 border"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                    onClick={() => toggleFilter(area)}
                  >
                    {area}
                    {activeFilters.includes(area) && " ✓"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results after filtering */}
          {filteredResults.length === 0 && (
            <div className="p-4 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-600">No charities match your current filters.</p>
              <button className="mt-2 text-blue-600 hover:text-blue-800" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          )}

          {/* Charity results */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {sortedResults.map((charity) => (
              <div
                key={charity.charityId}
                className={`${
                  viewMode === "grid" ? "h-full" : ""
                } p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => toggleExpanded(charity.charityId)}
              >
                <div className="flex flex-col mb-2">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="text-xl font-medium text-blue-700">{charity.name}</h4>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchBadgeColor(charity.match_details.match_type)}`}
                      >
                        {getMatchTypeLabel(charity.match_details.match_type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.round(charity.relevance_score * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {Math.round(charity.relevance_score * 100)}%
                    </span>
                  </div>
                </div>

                <p className={`text-gray-700 ${expandedCharity === charity.charityId ? "" : "line-clamp-2"}`}>
                  {charity.description}
                </p>

                {/* Website link - new addition */}
                {charity.website && (
                  <div className="mt-2">
                    <button
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      onClick={(e) => handleWebsiteClick(e, charity.website)}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                      {formatWebsiteUrl(charity.website)}
                    </button>
                  </div>
                )}

                {charity.focus_areas.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {charity.focus_areas.map((area, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded ${
                            activeFilters.includes(area) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFilter(area)
                          }}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {expandedCharity === charity.charityId && (
                  <div className="mt-4 pt-3 border-t">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      onClick={(e) => handleWebsiteClick(e, charity.website)}
                    >
                      Learn more about {charity.name}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && results.length === 0 && (
        <div className="mt-8 text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-3">
            {query
              ? "No matching charities found. Try a different search."
              : "Enter a cause to find matching charities."}
          </p>
          {query && <p className="text-sm text-gray-400">Try using broader terms or check for spelling mistakes.</p>}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <main className="container min-h-screen flex flex-col items-center md:p-12 bg-gray-50">
      <div className="max-w-5xl w-full pt-20 pb-8">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-8 rounded-lg mb-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Find Your Cause</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Tell us what you care about, and we'll help you discover charities that align with your values.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <CharitySearch />
          </CardContent>
      </div>
    </main>
  )
}

