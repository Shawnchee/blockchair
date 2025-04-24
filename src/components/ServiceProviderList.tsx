"use client"

import { useState, useEffect } from "react"
import supabase from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Star, MapPin, Briefcase, Building, Globe } from "lucide-react"

// Define interfaces for our data structures
interface ServiceProvider {
  id: number
  name: string
  category: string
  location: string
  rating: number
  project_count: number
  verified: boolean
  wallet_address: string
  website_url?: string
  email?: string
  description?: string
}

interface Project {
  id: number
  title: string
  description: string
  image_url?: string
  completed_date?: string
  provider_wallet_address?: string
}

export default function ServiceProviderList() {
  // State for service providers
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for selected provider and their projects
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [providerProjects, setProviderProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch service providers on component mount
  useEffect(() => {
    async function fetchServiceProviders() {
      try {
        setLoading(true)

        // Fetch service providers from Supabase
        const { data: providersData, error: providersError } = await supabase
          .from('service_providers')
          .select('*')

        if (providersError) {
          throw providersError
        }

        // Transform the data to match our interface
        if (providersData && providersData.length > 0) {
          const transformedProviders = providersData.map(provider => ({
            id: provider.id,
            name: provider.name,
            category: provider.category,
            location: provider.location,
            rating: provider.rating || 4.5, // Default rating if not available
            project_count: provider.project_count || 0,
            verified: provider.verified === true || provider.verified === 'TRUE',
            wallet_address: provider.wallet_address,
            website_url: provider.website_url,
            email: provider.email,
            description: provider.description
          }));

          setProviders(transformedProviders)
        } else {
          setProviders([])
        }
      } catch (error) {
        console.error('Error fetching service providers:', error)
        setError('Failed to load service providers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceProviders()
  }, [])

  // Function to fetch projects for a specific provider
  const fetchProviderProjects = async (provider: ServiceProvider) => {
    try {
      setSelectedProvider(provider)
      setProjectsLoading(true)
      setModalOpen(true)

      // Check if the projects table exists
      const { error: tableError } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
        .single()

      // If the table doesn't exist or there's an error, use mock data for demo
      if (tableError) {
        console.warn('Projects table may not exist, using mock data for demo:', tableError)

        // Create mock projects based on the provider
        const mockProjects = [
          {
            id: 1,
            title: `${provider.name} Sample Project 1`,
            description: `This is a sample project by ${provider.name} in the ${provider.category} category.`,
            image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3',
            completed_date: new Date().toISOString().split('T')[0],
            provider_wallet_address: provider.wallet_address
          },
          {
            id: 2,
            title: `${provider.name} Sample Project 2`,
            description: `Another sample project by ${provider.name} showcasing their expertise in ${provider.category}.`,
            image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3',
            completed_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            provider_wallet_address: provider.wallet_address
          }
        ]

        setProviderProjects(mockProjects)
        return
      }

      // If the table exists, fetch real projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('provider_wallet_address', provider.wallet_address)

      if (error) {
        throw error
      }

      setProviderProjects(data || [])
    } catch (error) {
      console.error('Error fetching provider projects:', error)
      setProviderProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : i < rating
                  ? 'text-yellow-400 fill-yellow-400 opacity-50'
                  : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  // Empty state
  if (providers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
          <Building className="h-10 w-10 text-teal-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Service Providers Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          There are currently no service providers available in our database.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold">{provider.name}</CardTitle>
                {provider.verified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardDescription>{provider.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {provider.location}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                {provider.project_count} {provider.project_count === 1 ? 'Project' : 'Projects'}
              </div>

              <div>
                {renderStarRating(provider.rating)}
              </div>

              {provider.description && (
                <div className="text-sm text-gray-600 mt-2">
                  <p className="line-clamp-2">{provider.description}</p>
                </div>
              )}

              {provider.website_url && (
                <div className="text-sm">
                  <a
                    href={provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => fetchProviderProjects(provider)}
              >
                View Portfolio
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Projects Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedProvider?.name} - Portfolio
            </DialogTitle>
            <DialogDescription>
              {selectedProvider?.project_count} {selectedProvider?.project_count === 1 ? 'Project' : 'Projects'} by this service provider
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {projectsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-32 w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : providerProjects.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No projects found for this service provider.</p>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {providerProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="text-lg font-medium mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>

                    {project.image_url && (
                      <div className="rounded-md overflow-hidden">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {project.completed_date && (
                      <div className="mt-3 text-sm text-gray-500 flex items-center">
                        <span>Completed: {new Date(project.completed_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
