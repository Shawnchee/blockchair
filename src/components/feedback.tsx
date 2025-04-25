"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, MapPin, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import supabase from "@/utils/supabase/client"
import ServiceProviderCard from "./ServiceProviderCard"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoaderIcon, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

export interface ServiceProvider {
  date: string
  time: string
  venue: string
  action: string
  images: string[]
  descriptions: string[]
}

interface Comment {
  id: string
  text?: string
  satisfaction_level: number
  latitude?: number
  longitude?: number
  milestone_id: number
  created_at?: string
  username?: string
  image_urls?: string[]
}

interface LatestUpdatesProps {
  campaignTitle: string
  isLoading?: boolean
}

export default function Feedback({ campaignTitle, isLoading = false }: LatestUpdatesProps) {
  const [activeMilestone, setActiveMilestone] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [satisfactionRating, setSatisfactionRating] = useState<string>("3")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [groupedComments, setGroupedComments] = useState<Comment[][]>([])
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const lastValidLocation: { latitude: number; longitude: number } | null = null

  // Control modal visibility based on submission status
  useEffect(() => {
    if (submissionStatus !== "idle") {
      setIsModalOpen(true)
    }
  }, [submissionStatus])

  // Handle auto-closing of success/error states
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (submissionStatus === "success" || submissionStatus === "error") {
      timer = setTimeout(() => {
        setIsModalOpen(false)
        // Only reset the status after the modal closing animation completes
        setTimeout(() => setSubmissionStatus("idle"), 300)
      }, 2000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [submissionStatus])

  const milestones = [
    {
      id: 1,
      name: "School Supplies Distribution",
      serviceProvider: {
        date: "May 15, 2023",
        time: "10:00 AM - 2:00 PM",
        venue: "Central Community Center",
        action: "Distribution of school supplies to 20 children in need",
        images: [
          "https://news.digitalmarketingphilippines.com/wp-content/uploads/2020/10/1200-X-628-FEATURED-IMAGE-scaled.jpeg",
          "https://news.digitalmarketingphilippines.com/wp-content/uploads/2022/09/Artboard-51-1-1024x980.webp",
        ],
        descriptions: ["Volunteers preparing backpacks with supplies", "Children receiving their new school supplies"],
      },
      communityFeedback: {
        comments: [
          {
            text: "It was wonderful to see the children's faces light up when they received their supplies!",
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            text: "The organization was excellent, no long waiting times.",
            image: "/placeholder.svg?height=200&width=300",
          },
        ],
        satisfactionRating: 4.2,
        totalVotes: 15,
      },
      // Location coordinates for this milestone
      location: {
        latitude: 14.5995,
        longitude: 120.9842, // Manila coordinates as example
      },
    },
    {
      id: 2,
      name: "Community Outreach Program",
      serviceProvider: {
        date: "April 28, 2023",
        time: "9:00 AM - 3:00 PM",
        venue: "Riverside Park",
        action: "Community outreach program serving meals and providing basic necessities",
        images: ["/placeholder.svg?height=300&width=400"],
        descriptions: ["Volunteers serving meals to community members"],
      },
      communityFeedback: {
        comments: [
          {
            text: "The food was great and the volunteers were very friendly!",
            image: "/placeholder.svg?height=200&width=300",
          },
        ],
        satisfactionRating: 4.5,
        totalVotes: 8,
      },
      // Location coordinates for this milestone
      location: {
        latitude: 14.6091,
        longitude: 120.9822, // Nearby Manila coordinates
      },
    },
    {
      id: 3,
      name: "Healthcare Initiative",
      serviceProvider: {
        date: "April 10, 2023",
        time: "1:00 PM - 5:00 PM",
        venue: "Downtown Health Clinic",
        action: "Providing basic medical supplies and services to underserved communities",
        images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
        descriptions: ["Medical professionals providing check-ups", "Distribution of medical supplies"],
      },
      communityFeedback: {
        comments: [
          {
            text: "The medical staff was very professional and caring.",
            image: "/placeholder.svg?height=200&width=300",
          },
        ],
        satisfactionRating: 4.8,
        totalVotes: 12,
      },
      // Location coordinates for this milestone
      location: {
        latitude: 3.1299430170212,
        longitude: 101.633149436231, // Makati coordinates as example
      },
    },
  ]

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("communitycomments")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching comments:", error.message)
        return
      }

      if (Array.isArray(data)) {
        const grouped: Comment[][] = milestones.map((milestones) => {
          return data.filter((comment) => comment.milestone_id === milestones.id)
        })
        setGroupedComments(grouped)
        console.log("COMMENTSS NIGGA:", grouped)
      }
    }

    fetchComments()
  }, []) // rerun if milestones change

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files)

      filesArray.forEach((file) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews((prev) => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })

      setImages((prev) => [...prev, ...filesArray])
    }
  }

  function calculateTotalVotes(comments: Comment[]): number {
    return getLength(comments) // Use getLength instead of comments.length
  }

  function calculateAverageRating(comments: Comment[]): number {
    const totalComments = getLength(comments)

    if (totalComments === 0) return 0

    const total = comments.reduce((sum, comment) => sum + comment.satisfaction_level, 0)
    return total / totalComments // Use totalComments instead of comments.length
  }

  function getLength(comments: Comment[]): number {
    try {
      if (!Array.isArray(comments)) {
        throw new Error("Expected an array of comments.")
      }
      return comments.length
    } catch (error) {
      console.error("Error in getLength function:", error)
      return 0 // Return 0 if there was an error
    }
  }

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            resolve({ latitude, longitude })
          },
          (error) => {
            console.error("Error getting location:", error)
            reject(error)
          },
        )
      } else {
        reject(new Error("Geolocation is not supported by this browser."))
      }
    })
  }

  const submitFeedback = async () => {
    setSubmissionStatus("loading") // Show loading modal

    const milestoneId = milestones[activeMilestone].id
    const satisfactionLevel = Number.parseInt(satisfactionRating)

    let imageUrls: string[] = []

    let latitude: number | null = null
    let longitude: number | null = null

    try {
      const location = await getLocation()
      latitude = location.latitude
      longitude = location.longitude
    } catch (error) {
      console.error("Location access denied or failed:", error)
      // You could provide a fallback here, like setting latitude/longitude to null or a default value.
    }

    if (images && images.length > 0) {
      const uploads = await Promise.all(
        images.map(async (imageFile) => {
          const filePath = `communityphoto/${Date.now()}-${imageFile.name}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("communityphoto")
            .upload(filePath, imageFile)

          if (uploadError) {
            console.error("Image upload failed:", uploadError)
            return null
          }

          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/communityphoto/${uploadData.path}`
        }),
      )

      // Remove any null entries from failed uploads
      imageUrls = uploads.filter((url): url is string => url !== null)
    }

    const { error } = await supabase.from("communitycomments").insert([
      {
        text: comment,
        satisfaction_level: satisfactionLevel,
        image_urls: imageUrls, // change column type to text[] in your table
        milestone_id: milestoneId,
        username: "John", // replace with actual user info if available
        latitude: latitude,
        longitude: longitude,
      },
    ])

    if (error) {
      console.error("Error submitting feedback:", error)
      setSubmissionStatus("error")
    } else {
      setSubmissionStatus("success")

      setComment("")
      setSatisfactionRating("3")
      setImages([])
      setImagePreviews([])

      // Refresh comments after submission
      const { data } = await supabase.from("communitycomments").select("*").order("created_at", { ascending: false })

      if (Array.isArray(data)) {
        const grouped: Comment[][] = milestones.map((milestone) => {
          return data.filter((comment) => comment.milestone_id === milestone.id)
        })
        setGroupedComments(grouped)
      }
    }
  }

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Function to render star rating
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
      </div>
    )
  }

  // Function to render location status based on distance
  const LocationStatus = ({ comment, milestoneIndex }: { comment: Comment; milestoneIndex: number }) => {
    // If location data is missing, return null
    if (!comment.latitude || !comment.longitude || !milestones[milestoneIndex]?.location) {
      return null
    }

    const milestoneLocation = milestones[milestoneIndex].location
    const distance = getDistanceFromLatLonInKm(
      comment.latitude,
      comment.longitude,
      milestoneLocation.latitude,
      milestoneLocation.longitude,
    )

    let statusColor = ""
    let statusText = ""

    if (distance <= 0.3) {
      statusColor = "text-green-600"
      statusText = "User is on site"
    } else if (distance <= 1) {
      statusColor = "text-yellow-600"
      statusText = "User is near site — please confirm location"
    } else {
      statusColor = "text-red-600"
      statusText = "Warning: User is likely not at the site"
    }

    return (
      <div className={`flex items-center gap-2 text-xs ${statusColor} mt-2`}>
        <MapPin className="h-3 w-3" />
        <div>
          <span className="font-medium">{statusText}</span>
          <span className="ml-1">({distance.toFixed(2)} km)</span>
        </div>
      </div>
    )
  }

  const activeComments = groupedComments[activeMilestone]
  const totalVotes = calculateTotalVotes(activeComments)
  const averageRating = calculateAverageRating(activeComments)

  const StatusModal = () => {
    const handleCloseModal = () => {
      setIsModalOpen(false)
      // Only reset the status after the modal closing animation completes
      setTimeout(() => setSubmissionStatus("idle"), 300)
    }

    return (
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-12">
          <AnimatePresence mode="wait">
            {submissionStatus === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center"
              >
                <LoaderIcon className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Submitting your feedback...</h3>
                <p className="text-sm text-muted-foreground mt-2">Please wait while we process your submission.</p>
              </motion.div>
            )}

            {submissionStatus === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4"
                >
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-medium">Feedback submitted successfully!</h3>
                <p className="text-sm text-muted-foreground mt-2">Thank you for sharing your experience.</p>
              </motion.div>
            )}

            {submissionStatus === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4"
                >
                  <XCircle className="h-8 w-8 text-red-600" />
                </motion.div>
                <h3 className="text-lg font-medium">Failed to submit feedback</h3>
                <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="border-0 bg-white shadow-sm dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium">Impact Updates</CardTitle>
        <CardDescription>Stay informed about the progress and impact of your donations</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Milestone Selection */}
        <div className="mb-4 flex flex-wrap gap-2">
          {milestones.map((milestone, index) => (
            <Button
              key={milestone.id}
              variant={activeMilestone === index ? "default" : "outline"}
              onClick={() => setActiveMilestone(index)}
              className="flex-grow sm:flex-grow-0"
            >
              Milestone {index + 1}: {milestone.name}
            </Button>
          ))}
        </div>

        {/* Milestone Content */}
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="service-provider">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="service-provider" className="flex-1">
                Service Provider Update
              </TabsTrigger>
              <TabsTrigger value="community-feedback" className="flex-1">
                Community Feedback
              </TabsTrigger>
            </TabsList>

            {/* Service Provider Update Tab */}
            <TabsContent value="service-provider" className="space-y-4">
              {/* Service Provider and Milestone Details side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Provider Card */}
                <ServiceProviderCard />

                {/* Milestone Details Card */}
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-4 text-lg font-medium">{milestones[activeMilestone].name} Details</h3>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">Date:</span>
                        <span>{milestones[activeMilestone].serviceProvider.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">Time:</span>
                        <span>{milestones[activeMilestone].serviceProvider.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">Venue:</span>
                        <span>{milestones[activeMilestone].serviceProvider.venue}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">Location:</span>
                        <span>
                          {milestones[activeMilestone].location.latitude.toFixed(4)},{" "}
                          {milestones[activeMilestone].location.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Action:</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {milestones[activeMilestone].serviceProvider.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Provider Images */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 text-lg font-medium">Implementation Photos</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {milestones[activeMilestone].serviceProvider.images.map((image, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="overflow-hidden rounded-md border">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Implementation photo ${idx + 1}`}
                          width={400}
                          height={300}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {milestones[activeMilestone].serviceProvider.descriptions[idx] || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Community Feedback Tab */}
            <TabsContent value="community-feedback" className="space-y-4">
              {/* Satisfaction Rating */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-2 text-lg font-medium">Community Satisfaction</h3>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={averageRating * 20} className="h-4" />
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
                    <p className="text-xs text-muted-foreground">Based on {totalVotes} votes</p>
                  </div>
                </div>
              </div>

              {/* Community Comments */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 text-lg font-medium">Community Feedback</h3>

                <div className="space-y-4">
                  {groupedComments[activeMilestone]?.map((comment, idx) => (
                    <div key={comment.id || idx} className="rounded-md border p-3">
                      <div className="flex gap-4">
                        {comment.image_urls?.[0] && (
                          <div className="hidden sm:block">
                            <Image
                              src={comment.image_urls[0] || "/placeholder.svg"}
                              alt="Feedback image"
                              width={100}
                              height={100}
                              className="h-24 w-24 rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm font-bold">{comment.username}</p>
                              {/* Add star rating component */}
                              {comment.satisfaction_level && <StarRating rating={comment.satisfaction_level} />}
                            </div>
                            {comment.created_at && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), "MMM d, yyyy • h:mm a")}
                              </p>
                            )}
                          </div>
                          <p className="text-sm mt-2">{comment.text}</p>

                          {/* Location status indicator */}
                          <LocationStatus comment={comment} milestoneIndex={activeMilestone} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Feedback */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 text-lg font-medium">Share Your Feedback</h3>

                <div className="space-y-4">
                  {/* Camera Interface */}
                  <div className="rounded-md border p-3">
                    <label htmlFor="photoInput" className="block mb-2 text-sm font-medium">
                      Take a Photo
                    </label>

                    <input
                      type="file"
                      id="photoInput"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    <button
                      type="button"
                      onClick={() => document.getElementById("photoInput")?.click()}
                      className="bg-[#0CD0A6] hover:bg-[#0AB993] text-white font-medium py-2 px-4 rounded-full w-full flex items-center justify-center gap-2 transition-colors"
                    >
                      Open Camera
                    </button>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-full border rounded-md overflow-hidden">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-auto max-h-[400px] object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = images.filter((_, i) => i !== index)
                              const updatedPreviews = imagePreviews.filter((_, i) => i !== index)
                              setImages(updatedImages)
                              setImagePreviews(updatedPreviews)
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                          >
                            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div>
                    <Label htmlFor="comment">Your Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience..."
                      className="mt-1"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  {/* Satisfaction Rating */}
                  <div>
                    <Label className="mb-2 block">Rate Your Satisfaction</Label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          type="button"
                          variant={satisfactionRating === rating.toString() ? "default" : "outline"}
                          className="h-10 w-10 p-0"
                          onClick={() => setSatisfactionRating(rating.toString())}
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={submitFeedback} className="w-full">
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <StatusModal />
    </Card>
  )
}
