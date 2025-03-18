"use client";
import { useState, useCallback } from "react";

interface CharityMatch {
  match_type: string; // "category", "description", or "both"
  match_strength: number; // 0-1 value
}

interface Charity {
  charityId: number;
  name: string;
  description: string;
  focus_areas: string[];
  relevance_score: number;
  match_details: CharityMatch;
}

// Debounce function to limit API calls
function useDebounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function CharitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized search function
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/predict?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data: Charity[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch charity recommendations. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search handler - only triggers after 300ms of inactivity
  const debouncedSearch = useDebounce(() => {
    fetchResults(query);
  }, 300);

  // Handler for search button click
  const handleSearch = () => {
    fetchResults(query);
  };

  // Get badge color based on match type
  const getMatchBadgeColor = (matchType: string) => {
    switch (matchType) {
      case "both": return "bg-purple-100 text-purple-800";
      case "category": return "bg-blue-100 text-blue-800";
      case "description": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get human-readable match type label
  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case "both": return "Category & Description";
      case "category": return "Category Match";
      case "description": return "Description Match";
      default: return "Match";
    }
  };

  return (
    <div className="w-full p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4">Find Your Cause</h2>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter a cause (e.g., education, environment, health)"
          className="flex-1 p-3 border rounded-md"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          className="md:w-auto w-full bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Find Charities"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

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

      {results.length > 0 && !isLoading ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recommended Charities:</h3>
          <div className="space-y-4">
            {results.map((charity) => (
              <div key={charity.charityId} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                  <h4 className="text-xl font-medium text-blue-700">{charity.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchBadgeColor(charity.match_details.match_type)}`}>
                      {getMatchTypeLabel(charity.match_details.match_type)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                      {Math.round(charity.relevance_score * 100)}% Match
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{charity.description}</p>
                
                {charity.focus_areas.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Focus Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {charity.focus_areas.map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && (
        <p className="mt-4 text-gray-500">
          {query ? "No matching charities found. Try a different search." : "Enter a cause to find matching charities."}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6 md:p-12 bg-gray-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Find Your Cause</h1>
          <p className="text-xl text-gray-600">
            Tell us what you care about, and we'll help you discover charities that align with your values.
          </p>
        </div>
        <CharitySearch />
      </div>
    </main>
  );
}