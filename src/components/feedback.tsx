"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Calendar, Camera, Upload } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface MilestoneTransaction {
  index: number
  name: string
  targetAmount: number
  txHash: string
  wallet: string
  company_name: string
  websiteurl: string
}

interface ServiceProviderUpdate {
  date: string
  time: string
  venue: string
  action: string
  images: string[]
  descriptions: string[]
}

interface CommunityFeedback {
  comments: { text: string; image?: string }[]
  satisfactionRating: number
  totalVotes: number
}

interface LatestUpdatesProps {
  contractAddress: string
  milestoneTransactions: MilestoneTransaction[]
  campaignTitle: string
  isLoading?: boolean
}

export default function Feedback({
  contractAddress,
  milestoneTransactions,
  campaignTitle,
  isLoading = false,
}: LatestUpdatesProps) {
  const [activeMilestone, setActiveMilestone] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [satisfactionRating, setSatisfactionRating] = useState<string>("3")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample milestone data - in a real app, this would come from your database
  const milestones = [
    {
      id: 1,
      name: "School Supplies Distribution",
      serviceProvider: {
        date: "May 15, 2023",
        time: "10:00 AM - 2:00 PM",
        venue: "Central Community Center",
        action: "Distribution of school supplies to 20 children in need",
        images: ["https://news.digitalmarketingphilippines.com/wp-content/uploads/2020/10/1200-X-628-FEATURED-IMAGE-scaled.jpeg", "https://news.digitalmarketingphilippines.com/wp-content/uploads/2022/09/Artboard-51-1-1024x980.webp"],
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
    },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  const submitPhoto = () => {
    // Handle image upload / form submission here
    console.log("Submitting photo:", capturedImage);
  };


  // Submit feedback
  const submitFeedback = () => {
    // In a real app, you would send this data to your backend
    alert("Feedback submitted successfully!")
    setCapturedImage(null)
    setComment("")
    setSatisfactionRating("3")
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
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 text-lg font-medium">{milestones[activeMilestone].name} Details</h3>

                <div className="grid gap-4 sm:grid-cols-2">
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
                  </div>

                  <div>
                    <span className="font-medium">Action:</span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {milestones[activeMilestone].serviceProvider.action}
                    </p>
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

                {/* For service providers to upload new images - in a real app, this would be protected */}
                <div className="mt-6 rounded-md border border-dashed p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Upload implementation photos</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Drag and drop or click to upload photos of your charity action
                    </p>
                    <Button size="sm" variant="outline" className="mt-4">
                      Upload Photos
                    </Button>
                  </div>
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
                    <Progress
                      value={milestones[activeMilestone].communityFeedback.satisfactionRating * 20}
                      className="h-4"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {milestones[activeMilestone].communityFeedback.satisfactionRating.toFixed(1)}/5
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Based on {milestones[activeMilestone].communityFeedback.totalVotes} votes
                    </p>
                  </div>
                </div>
              </div>

              {/* Community Comments */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 text-lg font-medium">Community Feedback</h3>

                <div className="space-y-4">
                  {milestones[activeMilestone].communityFeedback.comments.map((comment, idx) => (
                    <div key={idx} className="rounded-md border p-3">
                      <div className="flex gap-4">
                        {comment.image && (
                          <div className="hidden sm:block">
                            <Image
                              src={comment.image || "/placeholder.svg"}
                              alt="Feedback image"
                              width={100}
                              height={100}
                              className="h-24 w-24 rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
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
                    <label htmlFor="photoInput" className="block mb-2 text-sm font-medium">Take a Photo</label>

                    <input
                      type="file"
                      id="photoInput"
                      capture="environment"
                      accept="image/*"
                    />

                    {/* <label htmlFor="photoInput">
                      <button type="button" className="capture-button px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Open Camera
                      </button>
                    </label> */}
                  </div>


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
    </Card>
  )
}
