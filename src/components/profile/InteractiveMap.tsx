"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import supabase from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Import MapComponent dynamically with SSR disabled
const MapComponent = dynamic(
  () => import("@/components/profile/mapComponent"),
  { ssr: false } // This is the key part - disable SSR for this component
)

// Known city coordinates and country mapping
const cityCoordinates = {
  "kuala lumpur": { lat: 3.139, lng: 101.6869, country: "Malaysia" },
  "malaysia": { lat: 4.2105, lng: 101.9758, country: "Malaysia" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  "germany": { lat: 51.1657, lng: 10.4515, country: "Germany" },
  // Keep your existing mapping...
}

// Get coordinates for a location string
const getCoordinates = (location: string) => {
  if (!location) return null
  
  const normalizedLocation = location.toLowerCase().trim()
  
  // Check for exact matches or partial matches
  for (const [key, coordinates] of Object.entries(cityCoordinates)) {
    if (
      normalizedLocation === key || 
      normalizedLocation.includes(key) ||
      key.includes(normalizedLocation)
    ) {
      return coordinates
    }
  }
  
  return null
}

interface Charity {
  id: string
  title: string
  cover_image?: string
  introduction?: string
  location?: string
  categories?: string[]
}

interface LocationGroup {
  coordinates: { lat: number; lng: number; country: string }
  charities: Charity[]
}

const InteractiveMap = () => {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCharity, setHoveredCharity] = useState<LocationGroup | null>(null)

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("charity_2")
          .select("id, title, cover_image, introduction, location, categories")
        
        if (error) throw error
        console.log("Fetched charities:", data)
        
        setCharities(data || [])
      } catch (err) {
        console.error("Error fetching charity data:", err)
        setError("Failed to load charity data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCharities()
  }, [])
  
  // Group charities by location
  const groupedLocations: Record<string, LocationGroup> = {}
  
  charities.forEach(charity => {
    if (!charity.location) return
    
    const coords = getCoordinates(charity.location)
    if (!coords) return
    
    const key = `${coords.lat}-${coords.lng}`
    if (!groupedLocations[key]) {
      groupedLocations[key] = {
        coordinates: coords,
        charities: []
      }
    }
    
    groupedLocations[key].charities.push(charity)
  })
  
  // Filter out locations with no valid coordinates
  const validLocations = Object.values(groupedLocations)
  
  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading charity locations...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }
  
  if (validLocations.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>No charity locations found</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative rounded-lg border overflow-hidden mt-8">
      <div className="absolute top-3 left-3 z-[999] bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md max-w-xs">
        <h3 className="font-semibold text-sm mb-1 text-teal-800">Charity Projects You've Donated To Worldwide</h3>
        <p className="text-xs text-gray-600">Click on markers to see project details or hover for quick info</p>
      </div>
      
      {/* Map component loaded dynamically with SSR disabled */}
      <MapComponent 
        validLocations={validLocations} 
        setHoveredCharity={setHoveredCharity} 
        hoveredCharity={hoveredCharity} 
      />
      
      {/* Hover card for charity info */}
      {hoveredCharity && (
        <div className="absolute top-3 right-3 z-[999] bg-white rounded-md shadow-lg p-3 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-teal-800">{hoveredCharity.coordinates.country}</h3>
            <Badge variant="outline" className="text-xs">
              {hoveredCharity.charities.length} project{hoveredCharity.charities.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {hoveredCharity.charities.length === 1 ? (
            <>
              {hoveredCharity.charities[0].cover_image && (
                <img
                  src={hoveredCharity.charities[0].cover_image}
                  alt={hoveredCharity.charities[0].title}
                  className="w-full h-24 object-cover rounded-sm mb-2"
                />
              )}
              <h4 className="font-semibold text-sm">{hoveredCharity.charities[0].title}</h4>
              <p className="text-xs text-gray-600 mt-1 mb-2 line-clamp-2">
                {hoveredCharity.charities[0].introduction}
              </p>
              <Progress 
                value={(40 / 100) * 100} 
                className="h-1 mb-2" 
              />
            </>
          ) : (
            <ul className="text-xs space-y-1">
              {hoveredCharity.charities.slice(0, 3).map((charity, i) => (
                <li key={i}>{charity.title}</li>
              ))}
              {hoveredCharity.charities.length > 3 && (
                <li className="text-gray-500">+{hoveredCharity.charities.length - 3} more projects</li>
              )}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-2">Click marker for details</p>
        </div>
      )}
    </div>
  )
}

export default InteractiveMap