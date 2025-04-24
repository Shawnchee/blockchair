"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Calendar, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import supabase from "@/utils/supabase/client"
import EXIF from 'exif-js';

// export interface Milestone {
//   id: string
//   charity_id: string
//   milestone_name: string
//   target_amount: number
//   company_name: string
//   funds_raised: number
//   status: "pending" | "completed"
//   service_provider: ServiceProvider
// }

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

export default function Feedback({
  campaignTitle,
  isLoading = false,
}: LatestUpdatesProps) {
  const [activeMilestone, setActiveMilestone] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [satisfactionRating, setSatisfactionRating] = useState<string>("3")
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([])
  const [groupedComments, setGroupedComments] = useState<Comment[][]>([])

  let lastValidLocation: { latitude: number; longitude: number } | null = null;

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

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('communitycomments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching comments:", error.message)
        return
      }

      if (Array.isArray(data)) {
        const grouped: Comment[][] = milestones.map(milestones => {
          return data.filter(comment => comment.milestone_id === milestones.id)
        });
        setGroupedComments(grouped);
        console.log("COMMENTSS NIGGA:", grouped)
      }

    }

    fetchComments()
  }, []) // rerun if milestones change

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newPreviews: string[] = [];

      filesArray.forEach((file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });

      setImages((prev) => [...prev, ...filesArray]);
    }
  }

  function calculateTotalVotes(comments: Comment[]): number {
    return getLength(comments); // Use getLength instead of comments.length
  }

  function calculateAverageRating(comments: Comment[]): number {
    const totalComments = getLength(comments);

    if (totalComments === 0) return 0;

    const total = comments.reduce((sum, comment) => sum + comment.satisfaction_level, 0);
    return total / totalComments; // Use totalComments instead of comments.length
  }

  function getLength(comments: Comment[]): number {
    try {
      if (!Array.isArray(comments)) {
        throw new Error("Expected an array of comments.");
      }
      return comments.length;
    } catch (error) {
      console.error("Error in getLength function:", error);
      return 0; // Return 0 if there was an error
    }
  }

  const getLocation = (): Promise<{ latitude: number, longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  };
  

  const submitFeedback = async () => {
    const milestoneId = milestones[activeMilestone].id;
    const satisfactionLevel = parseInt(satisfactionRating);

    let imageUrls: string[] = [];

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const location = await getLocation();
      latitude = location.latitude;
      longitude = location.longitude;
    } catch (error) {
      console.error("Location access denied or failed:", error);
      // You could provide a fallback here, like setting latitude/longitude to null or a default value.
    }

    if (images && images.length > 0) {
      const uploads = await Promise.all(
        images.map(async (imageFile) => {
          const filePath = `communityphoto/${Date.now()}-${imageFile.name}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("communityphoto")
            .upload(filePath, imageFile);

          if (uploadError) {
            console.error("Image upload failed:", uploadError);
            return null;
          }

          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/communityphoto/${uploadData.path}`;
        })
      );

      // Remove any null entries from failed uploads
      imageUrls = uploads.filter((url): url is string => url !== null);
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
      }
    ]);

    if (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } else {
      alert("Feedback submitted successfully!");
      setComment("");
      setSatisfactionRating("3");
      setImages([]);
      setImagePreviews([]);
    }
  };

  // const activeComments = groupedComments[activeMilestone];
  // const totalVotes = calculateTotalVotes(activeComments);
  // const averageRating = calculateAverageRating(activeComments);


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

              </div>
            </TabsContent>

            {/* Community Feedback Tab */}
            <TabsContent value="community-feedback" className="space-y-4">
              {/* Satisfaction Rating */}
              {/* { <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-2 text-lg font-medium">Community Satisfaction</h3>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress
                      value={milestones.communityFeedback. * 20}
                      className="h-4"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {averageRating}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Based on {totalVotes} votes
                    </p>
                  </div>
                </div>
              </div>  */}


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
                              src={comment.image_urls[0]}
                              alt="Feedback image"
                              width={100}
                              height={100}

                              className="h-24 w-24 rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold" >{comment.username}</p>
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
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    <button
                      type="button"
                      onClick={() => document.getElementById('photoInput').click()}
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
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-auto max-h-[400px] object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = images.filter((_, i) => i !== index);
                              const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
                              setImages(updatedImages);
                              setImagePreviews(updatedPreviews);
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                          >
                            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    </Card>
  )
}
