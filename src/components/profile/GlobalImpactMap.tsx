"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Globe, MapPin, Users, Heart, ArrowRight } from "lucide-react"

interface DonationLocation {
  id: number
  country: string
  region: string
  projectCount: number
  amountDonated: number
  currency: string
  impactMetric: string
  impactValue: number
  coordinates: [number, number] // [latitude, longitude]
  flag: string
}

interface GlobalImpactMapProps {
  walletAddress: string
  ethToMyr: number
}

export default function GlobalImpactMap({ walletAddress, ethToMyr }: GlobalImpactMapProps) {
  const [donationLocations, setDonationLocations] = useState<DonationLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<DonationLocation | null>(null)
  const [activeView, setActiveView] = useState<"map" | "list">("map")
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // In a real app, this would fetch actual donation location data
    // For demo purposes, we're using sample data
    const fetchDonationLocations = async () => {
      setLoading(true)
      
      // Sample data
      const sampleLocations: DonationLocation[] = [
        {
          id: 1,
          country: "Malaysia",
          region: "Kuala Lumpur",
          projectCount: 3,
          amountDonated: 1500,
          currency: "MYR",
          impactMetric: "students supported",
          impactValue: 15,
          coordinates: [3.1390, 101.6869],
          flag: "🇲🇾"
        },
        {
          id: 2,
          country: "Indonesia",
          region: "Jakarta",
          projectCount: 1,
          amountDonated: 800,
          currency: "MYR",
          impactMetric: "families helped",
          impactValue: 8,
          coordinates: [-6.2088, 106.8456],
          flag: "🇮🇩"
        },
        {
          id: 3,
          country: "Thailand",
          region: "Bangkok",
          projectCount: 2,
          amountDonated: 1200,
          currency: "MYR",
          impactMetric: "meals provided",
          impactValue: 240,
          coordinates: [13.7563, 100.5018],
          flag: "🇹🇭"
        },
        {
          id: 4,
          country: "Philippines",
          region: "Manila",
          projectCount: 1,
          amountDonated: 600,
          currency: "MYR",
          impactMetric: "medical kits distributed",
          impactValue: 12,
          coordinates: [14.5995, 120.9842],
          flag: "🇵🇭"
        },
        {
          id: 5,
          country: "Vietnam",
          region: "Ho Chi Minh City",
          projectCount: 1,
          amountDonated: 500,
          currency: "MYR",
          impactMetric: "trees planted",
          impactValue: 50,
          coordinates: [10.8231, 106.6297],
          flag: "🇻🇳"
        }
      ]
      
      setDonationLocations(sampleLocations)
      setLoading(false)
    }
    
    fetchDonationLocations()
  }, [walletAddress])
  
  const totalCountries = donationLocations.length
  const totalProjects = donationLocations.reduce((sum, loc) => sum + loc.projectCount, 0)
  const totalDonated = donationLocations.reduce((sum, loc) => sum + loc.amountDonated, 0)
  
  if (loading) {
    return (
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-teal-800 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-teal-600" />
            Global Impact Map
          </CardTitle>
          <CardDescription>
            Loading your global donation impact...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-teal-800 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-teal-600" />
          Global Impact Map
        </CardTitle>
        <CardDescription>
          See the global reach and impact of your donations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div 
            className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center text-teal-700 mb-1">
              <Globe className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Countries Impacted</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-teal-800">{totalCountries}</span>
              <p className="text-xs text-teal-600 mt-1">
                Your donations have reached {totalCountries} countries
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center text-teal-700 mb-1">
              <Heart className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Projects Supported</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-teal-800">{totalProjects}</span>
              <p className="text-xs text-teal-600 mt-1">
                Across {totalCountries} different regions
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center text-teal-700 mb-1">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Total Impact</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-teal-800">{totalDonated.toLocaleString()} MYR</span>
              <p className="text-xs text-teal-600 mt-1">
                Donated to international causes
              </p>
            </div>
          </motion.div>
        </div>
        
        <Tabs defaultValue="map" className="w-full" onValueChange={(value) => setActiveView(value as "map" | "list")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="space-y-4">
            <div className="bg-white rounded-lg border border-teal-100 p-4">
              <div className="relative h-[400px] bg-teal-50 rounded-lg overflow-hidden">
                {/* In a real app, this would be an actual map component */}
                <div className="absolute inset-0 bg-teal-50 flex items-center justify-center">
                  <div className="text-center text-teal-700">
                    <Globe className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Interactive map would be displayed here</p>
                    <p className="text-xs mt-2">Showing donation locations across {totalCountries} countries</p>
                  </div>
                </div>
                
                {/* Sample map pins */}
                {donationLocations.map((location) => (
                  <motion.div
                    key={location.id}
                    className="absolute cursor-pointer"
                    style={{
                      // This is a simplified positioning - in a real map component, 
                      // you would use proper geo-positioning
                      left: `${(location.coordinates[1] + 180) / 360 * 100}%`,
                      top: `${(90 - location.coordinates[0]) / 180 * 100}%`,
                    }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="relative">
                      <MapPin className="h-6 w-6 text-red-500 -mt-6 -ml-3" />
                      <span className="absolute -top-8 -left-2 text-lg">{location.flag}</span>
                    </div>
                  </motion.div>
                ))}
                
                {/* Location detail popup */}
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-teal-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-teal-800 flex items-center">
                          <span className="mr-2 text-xl">{selectedLocation.flag}</span>
                          {selectedLocation.country}
                        </h3>
                        <p className="text-sm text-teal-600">{selectedLocation.region}</p>
                      </div>
                      <Badge>{selectedLocation.projectCount} Projects</Badge>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-teal-600">Amount Donated</p>
                        <p className="font-medium text-teal-800">
                          {selectedLocation.amountDonated.toLocaleString()} {selectedLocation.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-teal-600">Impact</p>
                        <p className="font-medium text-teal-800">
                          {selectedLocation.impactValue} {selectedLocation.impactMetric}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedLocation(null)}>
                        Close
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {donationLocations.map((location) => (
                  <Badge 
                    key={location.id} 
                    variant="outline" 
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <span>{location.flag}</span>
                    <span>{location.country}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <div className="bg-white rounded-lg border border-teal-100 overflow-hidden">
              <div className="p-4 bg-teal-50 border-b border-teal-100">
                <h3 className="font-medium text-teal-800">Donation Locations</h3>
              </div>
              
              <div className="divide-y divide-teal-100">
                {donationLocations.map((location) => (
                  <motion.div
                    key={location.id}
                    className="p-4 hover:bg-teal-50/30 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-teal-800 flex items-center">
                          <span className="mr-2 text-lg">{location.flag}</span>
                          {location.country}
                        </h4>
                        <p className="text-sm text-teal-600">{location.region}</p>
                      </div>
                      <Badge>{location.projectCount} Projects</Badge>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-teal-600">Amount Donated</p>
                        <p className="font-medium text-teal-800">
                          {location.amountDonated.toLocaleString()} {location.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-teal-600">Impact</p>
                        <p className="font-medium text-teal-800">
                          {location.impactValue} {location.impactMetric}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <span>View Projects</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 bg-teal-50/50 p-3 rounded-lg border border-teal-100 text-sm text-teal-700">
          <p>
            Your donations have made a significant impact across Southeast Asia, helping communities in need with education, 
            healthcare, and environmental initiatives.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
