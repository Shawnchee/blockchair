"use client"

import { useState, useEffect } from "react"
import supabase from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Star, MapPin, Building, Globe, Mail, Wallet, Phone, Clock } from "lucide-react"
import Image from "next/image"

// Define interfaces for our data structures
interface ServiceProvider {
  id: number
  name: string
  category: string
  location: string
  rating: number
  projects_count: number
  verified: boolean
  wallet_address?: string
  website_url?: string
  email?: string
  description?: string
  trust_score?: number
}

interface Project {
  id: number
  title: string
  description: string
  image_url?: string
  completed_date?: string
  provider_wallet_address?: string
}

export default function ServiceProviderCard() {
  // State for service provider
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for projects
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("portfolio")

  // Fetch service provider data on component mount
  useEffect(() => {
    async function fetchServiceProviderData() {
      try {
        setLoading(true)

        // Fetch service provider from Supabase
        const { data: providerData, error: providerError } = await supabase
          .from('service_providers')
          .select('*')
          .eq('id', 1) // Fetch Maybe Construction (ID 1)
          .single()

        if (providerError) {
          throw providerError
        }

        // Transform the data to match our interface
        if (providerData) {
          const transformedProvider = {
            id: providerData.id,
            name: providerData.name || "Maybe Construction",
            category: providerData.category || "Education",
            location: providerData.location || "Penang, Malaysia",
            rating: providerData.rating || 4.8,
            projects_count: providerData.projects_count || 27,
            verified: providerData.verified === true || providerData.verified === 'TRUE',
            wallet_address: providerData.wallet_address || "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
            website_url: providerData.website_url || "maybeconst.org",
            email: providerData.email || "info@maybeconst.org",
            description: providerData.description || "Maybe Construction specializes in sustainable building practices for schools, community centers, and healthcare facilities in developing states.",
            trust_score: providerData.trust_score || 4.8
          }

          setProvider(transformedProvider)

          // Also fetch projects if there's a wallet address
          if (transformedProvider.wallet_address) {
            await fetchProjects(transformedProvider.wallet_address)
          }
        }
      } catch (error) {
        console.error('Error fetching service provider data:', error)
        setError('Failed to load service provider data. Please try again later.')

        // Use fallback data
        setProvider({
          id: 1,
          name: "Maybe Construction",
          category: "Education",
          location: "Penang, Malaysia",
          rating: 4.8,
          projects_count: 27,
          verified: true,
          wallet_address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
          website_url: "maybeconst.org",
          email: "info@maybeconst.org",
          description: "Maybe Construction specializes in sustainable building practices for schools, community centers, and healthcare facilities in developing states.",
          trust_score: 4.8
        })

        // Fetch fallback projects
        fetchFallbackProjects()
      } finally {
        setLoading(false)
      }
    }

    fetchServiceProviderData()
  }, [])

  // Function to fetch projects for the service provider
  const fetchProjects = async (walletAddress: string) => {
    try {
      setProjectsLoading(true)

      // Check if the projects table exists
      const { error: tableError } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
        .single()

      // If the table doesn't exist or there's an error, use fallback data
      if (tableError) {
        console.warn('Projects table may not exist, using fallback data:', tableError)
        fetchFallbackProjects()
        return
      }

      // If the table exists, fetch real projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('provider_wallet_address', walletAddress)

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        setProjects(data)
      } else {
        // No projects found, use fallback
        fetchFallbackProjects()
      }
    } catch (error) {
      console.error('Error fetching service provider projects:', error)
      fetchFallbackProjects()
    } finally {
      setProjectsLoading(false)
    }
  }

  // Function to use fallback project data
  const fetchFallbackProjects = () => {
    const fallbackProjects = [
      {
        id: 1,
        title: "School Building in Penang",
        description: "Built a new school building with sustainable materials",
        image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3",
        completed_date: "2023-05-15",
        provider_wallet_address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
      },
      {
        id: 2,
        title: "Educational Center in Kuala Lumpur",
        description: "Complete renovation of an educational center serving 500 students",
        image_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3",
        completed_date: "2023-02-10",
        provider_wallet_address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
      },
      {
        id: 3,
        title: "Learning Hub in Johor Bahru",
        description: "Construction of a learning hub with modern facilities",
        image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3",
        completed_date: "2023-08-22",
        provider_wallet_address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
      }
    ]

    setProjects(fallbackProjects)
  }

  // Function to open modal with specific tab
  const openModalWithTab = (tab: string) => {
    setActiveTab(tab)
    setModalOpen(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !provider) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  // No provider state
  if (!provider) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
          <Building className="h-10 w-10 text-teal-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Service Provider Not Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn't find the service provider in our database.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Building className="w-8 h-8 text-gray-700" />
              </div>
              <CardTitle className="text-xl font-semibold">{provider.name}</CardTitle>
            </div>
            {provider.verified && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Building className="h-4 w-4 text-gray-400" />
            <span>{provider.category}</span>
            <span className="mx-1">•</span>
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{provider.location}</span>
            <span className="mx-1">•</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1">{provider.rating}</span>
            </div>
          </div>

          {/* Trust Score Badge */}
          <div className="mt-2 flex items-center">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              Trust Score: {provider.trust_score || 4.5}/5
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          {/* Additional details */}
          <div className="mb-4 text-sm text-gray-600">
            <p className="line-clamp-2">{provider.description}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-blue-50 rounded-md p-2">
              <p className="text-xs text-blue-600 mb-1">Projects</p>
              <p className="font-semibold text-blue-700">{provider.projects_count}</p>
            </div>
            <div className="bg-green-50 rounded-md p-2">
              <p className="text-xs text-green-600 mb-1">Rating</p>
              <p className="font-semibold text-green-700 flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                {provider.rating}
              </p>
            </div>
            <div className="bg-purple-50 rounded-md p-2">
              <p className="text-xs text-purple-600 mb-1">Since</p>
              <p className="font-semibold text-purple-700">2018</p>
            </div>
          </div>

          {/* View Portfolio button */}
          <Button 
            className="w-full"
            onClick={() => openModalWithTab("portfolio")}
          >
            View Portfolio
          </Button>
        </CardContent>
      </Card>

      {/* Modal with Tabs */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <Building className="w-8 h-8 text-gray-700" />
                </div>
                <DialogTitle className="text-xl font-semibold">{provider.name}</DialogTitle>
              </div>
              {provider.verified && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Building className="h-4 w-4 text-gray-400" />
              <span>{provider.category}</span>
              <span className="mx-1">•</span>
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{provider.location}</span>
              <span className="mx-1">•</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1">{provider.rating}</span>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none h-12 bg-gray-50 p-0">
                <TabsTrigger value="portfolio" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none flex-1">
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="about" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none flex-1">
                  About
                </TabsTrigger>
                <TabsTrigger value="contact" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none flex-1">
                  Contact
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="p-0 mt-0">
              <div className="p-4 mb-4 border-b">
                <h3 className="text-lg font-medium mb-2">Our Projects</h3>
                <p className="text-gray-600 text-sm">
                  {provider.name} has completed {provider.projects_count} projects across Malaysia,
                  focusing on sustainable building practices for schools, community centers, and educational facilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {projectsLoading ? (
                  <>
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <Skeleton className="h-40 w-full" />
                        <div className="p-3">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : projects.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 col-span-2">No projects found for this service provider.</p>
                ) : (
                  <>
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                        {project.image_url && (
                          <div className="h-40 overflow-hidden relative">
                            <img
                              src={project.image_url}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                            {project.completed_date && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Completed: {new Date(project.completed_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-base font-medium mb-1">{project.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              Sustainable
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              Community
                            </Badge>
                            {project.title.toLowerCase().includes("school") && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                Education
                              </Badge>
                            )}
                            {project.title.toLowerCase().includes("learning") && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Learning
                              </Badge>
                            )}
                          </div>

                          <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-8">
                            View Project Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="p-4 border-t">
                <Button variant="outline" className="w-full">
                  View All {provider.projects_count} Projects
                </Button>
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="p-4 mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">About {provider.name}</h3>
                <p className="text-gray-700">{provider.description}</p>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Company Mission</h4>
                  <p className="text-sm text-blue-700">
                    {provider.name} is committed to sustainable practices that benefit communities while minimizing environmental impact. We prioritize local community involvement in all our projects.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Projects Completed</h4>
                    <p className="text-2xl font-bold text-blue-600">{provider.projects_count}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Service Type</h4>
                    <p className="text-gray-800">{provider.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <p className="text-gray-800">{provider.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Rating</h4>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 font-medium">{provider.rating}</span>
                      <span className="text-gray-500 ml-1">/5</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-50">School Construction</Badge>
                    <Badge variant="outline" className="bg-gray-50">Educational Centers</Badge>
                    <Badge variant="outline" className="bg-gray-50">Learning Facilities</Badge>
                    <Badge variant="outline" className="bg-gray-50">Sustainable Building</Badge>
                    <Badge variant="outline" className="bg-gray-50">Solar Integration</Badge>
                    <Badge variant="outline" className="bg-gray-50">Water Management</Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Green Building Certified</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>ISO 9001</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Community Partner</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="p-4 mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <a
                      href={`mailto:${provider.email}`}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {provider.email}
                    </a>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Website</h4>
                    <a
                      href={`https://${provider.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      {provider.website_url}
                    </a>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Office Address</h4>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      123 Education Road<br />
                      {provider.location}<br />
                      Malaysia
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                    <a href="tel:+60123456789" className="text-sm text-blue-600 hover:underline">+60 12-345 6789</a>
                  </div>
                </div>

                {provider.wallet_address && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Wallet Address</h4>
                    <div className="flex items-center text-sm text-gray-600 break-all">
                      <Wallet className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="font-mono">{provider.wallet_address}</span>
                    </div>
                  </div>
                )}

                {/* Trust Score */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-600" />
                    Trust Score
                  </h4>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(provider.trust_score || 4.5)
                              ? 'text-yellow-400 fill-yellow-400'
                              : i < (provider.trust_score || 4.5)
                                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-yellow-700">
                      {(provider.trust_score || 4.5).toFixed(1)}/5
                    </span>
                    <span className="ml-2 text-sm text-yellow-700">
                      Based on {provider.projects_count} completed projects
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button className="w-full">Contact for Project</Button>
                  <Button variant="outline" className="w-full">Download Profile</Button>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Business Hours
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-amber-700">
                    <div>Monday - Friday:</div>
                    <div>9:00 AM - 5:30 PM</div>
                    <div>Saturday:</div>
                    <div>9:00 AM - 1:00 PM</div>
                    <div>Sunday:</div>
                    <div>Closed</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
