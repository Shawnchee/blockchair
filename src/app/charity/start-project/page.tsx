"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  ArrowRight,
  ImageIcon,
  Check,
  Info,
  Plus,
  Trash2,
  LightbulbIcon,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import supabase from "@/utils/supabase/client"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  coverImageUrl: z.string().url("Please enter a valid image URL").or(z.literal("")),
  introduction: z
    .string()
    .min(100, "Introduction must be at least 100 characters")
    .max(5000, "Introduction must be less than 5000 characters"),
  category: z.enum([
    "education",
    "environment",
    "healthcare",
    "poverty",
    "animal welfare",
    "human rights",
    "arts",
    "disaster relief",
    "children",
    "veteran",
  ]),
  contactInfo: z.string().min(10, "Contact information must be at least 10 characters"),
  totalAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Please enter a valid amount greater than 0" }),
  organizationName: z.string().min(3, "Organization name must be at least 3 characters"), // New field
  location: z.string().min(3, "Location must be at least 3 characters"),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3, "Milestone title must be at least 3 characters"),
        targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Please enter a valid amount greater than 0",
        }),
        targetPercentage: z.number().min(1).max(100),
        companyName: z.string().min(3, "Company name must be at least 3 characters"),
        walletAddress: z.string().min(10, "Wallet address must be at least 10 characters"),
      }),
    )
    .min(1, "At least one milestone is required"),
  // solutions: z
  //   .array(
  //     z.object({
  //       title: z.string().min(3, "Solution title must be at least 3 characters"),
  //       description: z.string().min(20, "Solution description must be at least 20 characters"),
  //     }),
  //   )
  //   .min(1, "At least one solution is required"),
})

// Category options with icons and descriptions
const categoryOptions = [
  { value: "education", label: "Education", description: "Educational initiatives and school programs" },
  { value: "environment", label: "Environment", description: "Environmental conservation and sustainability" },
  { value: "healthcare", label: "Healthcare", description: "Medical services and health initiatives" },
  { value: "poverty", label: "Poverty", description: "Poverty alleviation and economic empowerment" },
  { value: "animal welfare", label: "Animal Welfare", description: "Animal protection and rescue" },
  { value: "human rights", label: "Human Rights", description: "Human rights advocacy and protection" },
  { value: "arts", label: "Arts & Culture", description: "Arts, culture, and heritage preservation" },
  { value: "disaster relief", label: "Disaster Relief", description: "Emergency response and disaster recovery" },
  { value: "children", label: "Children", description: "Child welfare and development programs" },
  { value: "veteran", label: "Veteran", description: "Support for veterans and their families" },
]

export default function StartProjectPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [totalAmountValue, setTotalAmountValue] = useState<number>(0)
  const [milestonesTotal, setMilestonesTotal] = useState<number>(0)
  const [milestonesTotalPercentage, setMilestonesTotalPercentage] = useState<number>(0)

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      coverImageUrl: "",
      introduction: "",
      category: "education",
      contactInfo: "",
      totalAmount: "",
      location: "",
      organizationName: "", // New field
      milestones: [{ title: "", targetAmount: "", targetPercentage: 100 ,companyName: "",
        walletAddress: "", }],
      // solutions: [{ title: "", description: "" }],
    },
  })

  // Set up field arrays for milestones and solutions
  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control: form.control,
    name: "milestones",
  })

  // const {
  //   fields: solutionFields,
  //   append: appendSolution,
  //   remove: removeSolution,
  // } = useFieldArray({
  //   control: form.control,
  //   name: "solutions",
  // })

  // Watch for changes in form values
  const watchTotalAmount = form.watch("totalAmount")
  const watchMilestones = form.watch("milestones")
  const watchCoverImageUrl = form.watch("coverImageUrl")

  // Update cover image preview when URL changes
  useEffect(() => {
    if (watchCoverImageUrl) {
      setCoverImagePreview(watchCoverImageUrl)
    } else {
      setCoverImagePreview(null)
    }
  }, [watchCoverImageUrl])

  // Update total amount value when it changes
  useEffect(() => {
    if (watchTotalAmount && !isNaN(Number(watchTotalAmount))) {
      setTotalAmountValue(Number(watchTotalAmount))
    } else {
      setTotalAmountValue(0)
    }
  }, [watchTotalAmount])

  // Calculate milestones total amount and percentage
  useEffect(() => {
    if (watchMilestones && watchMilestones.length > 0) {
      const total = watchMilestones.reduce((sum, milestone) => {
        const amount = Number(milestone.targetAmount) || 0
        return sum + amount
      }, 0)

      setMilestonesTotal(total)

      if (totalAmountValue > 0) {
        setMilestonesTotalPercentage((total / totalAmountValue) * 100)
      } else {
        setMilestonesTotalPercentage(0)
      }
    } else {
      setMilestonesTotal(0)
      setMilestonesTotalPercentage(0)
    }
  }, [watchMilestones, totalAmountValue])

  // Update milestone target amount when percentage changes
  const updateMilestoneAmount = (index: number, percentage: number) => {
    const milestones = form.getValues("milestones")
    const totalAmount = Number(form.getValues("totalAmount")) || 0

    if (totalAmount > 0) {
      // Limit percentage to 99% max for administration fee
      const limitedPercentage = Math.min(percentage, 99)
      const newAmount = (limitedPercentage / 100) * totalAmount
      milestones[index].targetAmount = newAmount.toFixed(2)
      milestones[index].targetPercentage = limitedPercentage

      form.setValue(`milestones.${index}.targetAmount`, newAmount.toFixed(2))
      form.setValue(`milestones.${index}.targetPercentage`, limitedPercentage)
    }
  }

  // Update milestone percentage when amount changes
  const updateMilestonePercentage = (index: number, amount: string) => {
    const totalAmount = Number(form.getValues("totalAmount")) || 0
    const amountValue = Number(amount) || 0

    if (totalAmount > 0 && amountValue > 0) {
      const newPercentage = (amountValue / totalAmount) * 100
      form.setValue(`milestones.${index}.targetPercentage`, Math.min(newPercentage, 100))
    }
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      // Validate that milestone total doesn't exceed 99% of total amount (1% admin fee)
      const maxAllowedAmount = totalAmountValue * 0.99
      if (milestonesTotal > maxAllowedAmount) {
        throw new Error(
          `Total milestone amounts cannot exceed 99% of the total fundraising goal (${maxAllowedAmount.toFixed(2)}). 1% is reserved for administration fees.`,
        )
      }

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to create a project")
      }

      // Insert project data into database
      const { data: projectData, error: insertError } = await supabase
        .from("charity_2")
        .insert([
          {
            title: values.title,
            cover_image: values.coverImageUrl,
            introduction: values.introduction,
            categories: [values.category],
            contact_info: values.contactInfo,
            total_amount: Number(values.totalAmount),
            location: values.location,
            organization_name: values.organizationName,
            // organization_id: session.user.id,
            // status: "pending", // Projects start as pending until approved
          },
        ])
        .select()

      if (insertError) {
        throw new Error(`Error creating project: ${insertError.message}`)
      }

      if (!projectData || projectData.length === 0) {
        throw new Error("Failed to create project: No data returned")
      }

      // Get the new project ID
      const newProjectId = projectData[0].id

      // Now insert milestones with reference to the parent project
      const { error: milestonesError } = await supabase.from("milestone").insert(
        values.milestones.map((milestone) => ({
          charity_2_id: newProjectId, // Use charity_id as the foreign key based on your schema
          milestone_name: milestone.title,
          target_amount: Number(milestone.targetAmount),
          status: "pending",
          company_name: milestone.companyName, // Add empty values for required fields
          wallet_address: milestone.walletAddress,
        })),
      )

      if (milestonesError) {
        throw new Error(`Error creating milestones: ${milestonesError.message}`)
      }

      // Redirect to success page or projects list
      router.push("/charity/browse-projects?success=true")
    } catch (error) {
      console.error("Error submitting project:", error)
      alert(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to get category label from value
  const getCategoryLabel = (value: string) => {
    return categoryOptions.find((option) => option.value === value)?.label || value
  }

  return (
    <div className="container max-w-6xl mx-auto pt-24 pb-8 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Start a Charity Project</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create your fundraising project and leverage blockchain technology for transparent, efficient charitable
          giving.
        </p>
      </div>

      <Card className="border-teal-100 shadow-lg p-0">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg py-4">
          <CardTitle className="text-2xl">Project Details</CardTitle>
          <CardDescription className="text-teal-100">
            Fill out the form below to create your charity project
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex justify-center w-full grid-cols-3 mb-8 py-4">
              <TabsTrigger value="details" className="text-base py-3">
                Project Details
              </TabsTrigger>
              <TabsTrigger value="milestones" className="text-base py-3">
                Milestones
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-base py-3">
                Preview
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="details">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                      <FormField
  control={form.control}
  name="organizationName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Organization Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter the name of your organization" {...field} />
      </FormControl>
      <FormDescription>
        Provide the name of the organization managing this project.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
                        {/* Project Title */}
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter a compelling title for your project" {...field} />
                              </FormControl>
                              <FormDescription>
                                Choose a clear, descriptive title that captures the essence of your project.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Category */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categoryOptions.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex flex-col text-start">
                                        <span>{category.label}</span>
                                        <span className="text-[10px] text-gray-500">{category.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>Choose the category that best represents your project.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Location */}
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Where will this project take place?" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the city, country, or region where your project will operate.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Total Amount */}
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Funding Goal</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    $
                                  </span>
                                  <Input
                                    className="pl-7"
                                    placeholder="Amount needed"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      // Recalculate milestone percentages when total changes
                                      const milestones = form.getValues("milestones")
                                      milestones.forEach((_, index) => {
                                        const amount = form.getValues(`milestones.${index}.targetAmount`)
                                        if (amount) {
                                          updateMilestonePercentage(index, amount)
                                        }
                                      })
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <div className="flex justify-between items-center mt-2">
                                <FormDescription>
                                  Set a realistic funding goal for your project (in USD).
                                </FormDescription>
                                <Button
                                  type="button"
                                  variant="link"
                                  className="text-yellow-600 font-medium flex items-center p-0 h-auto cursor-pointer"
                                  onClick={() => router.push("/charity/ai-smart-donation")}
                                >
                                  <LightbulbIcon className="h-4 w-4 mr-1" />
                                  Need help with fundraising goals?
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-6">
                        {/* Cover Image URL */}
                        <FormField
                          control={form.control}
                          name="coverImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/your-image.jpg" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the URL of a high-quality image that represents your project (recommended size:
                                1200x630px).
                              </FormDescription>
                              <FormMessage />

                              {/* Image Preview */}
                              <div className="mt-2 border rounded-md overflow-hidden h-40 bg-gray-50">
                                {coverImagePreview ? (
                                  <img
                                    src={coverImagePreview || "/placeholder.svg"}
                                    alt="Cover preview"
                                    className="w-full h-full object-cover"
                                    onError={() => setCoverImagePreview(null)}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400">
                                    <div className="text-center">
                                      <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                                      <p className="text-sm">Image preview will appear here</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Contact Info */}
                        <FormField
                          control={form.control}
                          name="contactInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Information</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide contact details for inquiries about this project"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Include email, phone number, or other ways donors can reach you.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Introduction */}
                    <FormField
                      control={form.control}
                      name="introduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your project, its goals, and its impact"
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of your project, including its purpose, goals, and expected
                            impact.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Solutions
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Solutions</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendSolution({ title: "", description: "" })}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Solution
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {solutionFields.map((field, index) => (
                          <Card key={field.id} className="border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Solution {index + 1}</h4>
                                {solutionFields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSolution(index)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove solution</span>
                                  </Button>
                                )}
                              </div> */}

                              {/* <div className="grid gap-4">
                                <FormField
                                  control={form.control}
                                  name={`solutions.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm">Title</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., Building A Digital Center" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`solutions.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm">Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Describe how this solution addresses the problem"
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div> */}

                    <div className="flex justify-end pt-4">
                      <Button type="button" onClick={() => setActiveTab("milestones")}>
                        Next: Set Milestones
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="milestones">
                  <div className="space-y-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-900">About Milestones</h3>
                          <p className="text-sm text-gray-600">
                            Milestones help donors understand how their contributions will be used at different funding
                            levels. Each milestone should represent a specific goal or achievement that will be unlocked
                            when the target amount is reached.
                          </p>
                          <p className="text-sm text-gray-600 mt-2 font-medium">
                            Note: Total milestone amounts cannot exceed 99% of your fundraising goal. 1% is reserved for
                            platform administration fees.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Milestone Summary */}
                    <Card className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Fundraising Summary</h3>
                          <span className="text-sm text-gray-500">
                            Total Goal: ${totalAmountValue.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Milestones Total:</span>
                            <span
                              className={milestonesTotal > totalAmountValue * 0.99 ? "text-red-500 font-medium" : ""}
                            >
                              ${milestonesTotal.toLocaleString()} ({milestonesTotalPercentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${milestonesTotalPercentage > 99 ? "bg-red-500" : "bg-teal-500"}`}
                              style={{ width: `${Math.min(milestonesTotalPercentage, 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm mt-2">
                            <span>Administration Fee (1%):</span>
                            <span className="text-gray-600">${(totalAmountValue * 0.01).toLocaleString()}</span>
                          </div>
                        </div>

                        {milestonesTotal > totalAmountValue * 0.99 && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                              Total milestone amounts (${milestonesTotal.toLocaleString()}) exceed 99% of your
                              fundraising goal (${(totalAmountValue * 0.99).toLocaleString()}). 1% is reserved for
                              administration fees.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    {/* Milestones */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Project Milestones</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendMilestone({ title: "", targetAmount: "", targetPercentage: 0 , companyName: "", walletAddress: ""})
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Milestone
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {milestoneFields.map((field, index) => (
                          <Card key={field.id} className="border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium">Milestone {index + 1}</h4>
                                {milestoneFields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMilestone(index)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove milestone</span>
                                  </Button>
                                )}
                              </div>

                              <div className="grid gap-4">
                                <FormField
                                  control={form.control}
                                  name={`milestones.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm">Milestone Title</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., Build Water Well" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`milestones.${index}.targetAmount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm">Target Amount</FormLabel>
                                        <FormControl>
                                          <div className="relative flex items-center">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                              $
                                            </span>
                                            <Input
                                              className="pl-7"
                                              placeholder="Amount needed"
                                              {...field}
                                              onChange={(e) => {
                                                field.onChange(e)
                                                updateMilestonePercentage(index, e.target.value)
                                              }}
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`milestones.${index}.targetPercentage`}
                                    render={({ field }: { field: any }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm">Percentage of Total Goal</FormLabel>
                                        <FormControl>
                                          <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                              <span>0%</span>
                                              <span>{field.value.toFixed(1)}%</span>
                                              <span className="text-gray-400">(Max: 99%)</span>
                                            </div>
                                            <Slider
                                              value={[field.value]}
                                              min={0}
                                              max={99} // Limit to 99% max
                                              step={1}
                                              onValueChange={(value: any) => {
                                                updateMilestoneAmount(index, value[0])
                                              }}
                                              className="py-2"
                                            />
                                          </div>
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                          Adjust the slider to set the percentage of your total goal for this milestone.
                                          Note: Total milestones cannot exceed 99% of your goal (1% is reserved for
                                          administration fees).
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                {/* Company Name */}
                                <FormField
                                  control={form.control}
                                  name={`milestones.${index}.companyName`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm">Company Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., ABC Corp" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Wallet Address */}
                                <FormField
                                  control={form.control}
                                  name={`milestones.${index}.walletAddress`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm">Wallet Address</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., 0x1234...abcd" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                        Back to Details
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("preview")}>
                        Preview Project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Project Preview</h2>
                      <Button variant="outline" onClick={() => setActiveTab("milestones")}>
                        Back to Edit
                      </Button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      {/* Cover Image Preview */}
                      <div className="relative h-64 bg-gray-200">
                        {coverImagePreview ? (
                          <img
                            src={coverImagePreview || "/placeholder.svg"}
                            alt="Project cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-400">
                              <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                              <p>No cover image uploaded</p>
                            </div>
                          </div>
                        )}

                        <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {form.watch("category") ? getCategoryLabel(form.watch("category")) : "Category"}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {form.watch("title") || "Project Title"}
                        </h3>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <span className="mr-4">{form.watch("location") || "Location"}</span>
                          <span>Goal: ${Number(form.watch("totalAmount") || 0).toLocaleString()}</span>
                        </div>

                        <div className="prose max-w-none mb-6">
                          <p className="text-gray-700">
                            {form.watch("introduction") || "Your project description will appear here."}
                          </p>
                        </div>

                        {/* Milestones Preview */}
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-900 mb-3">Project Milestones</h4>
                          <div className="space-y-3">
                            {form.watch("milestones").map((milestone, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                  <h5 className="font-medium">{milestone.title || `Milestone ${index + 1}`}</h5>
                                  <span className="text-sm text-teal-600 font-medium">
                                    ${Number(milestone.targetAmount || 0).toLocaleString()} (
                                    {milestone.targetPercentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Solutions Preview
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-900 mb-3">Our Solutions</h4>
                          <div className="space-y-4">
                            {form.watch("solutions").map((solution, index) => (
                              <div key={index} className="mb-4">
                                <h5 className="font-medium text-gray-900">
                                  {solution.title || `Solution ${index + 1}`}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {solution.description || "Solution description"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div> */}

                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-teal-500" />
                            Contact Information
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {form.watch("contactInfo") || "Your contact information will appear here."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-teal-600">
                            <Check className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Blockchain Verified</span>
                          </div>

                          <Button className="bg-teal-500 hover:bg-teal-600" disabled>
                            Donate Now
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <p className="text-gray-500 mb-4">Happy with your project? Submit it for review.</p>
                      <Button
                        type="submit"
                        disabled={isSubmitting || milestonesTotal > totalAmountValue * 0.99}
                        className="bg-teal-500 hover:bg-teal-600 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Project"
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-gray-50 p-6 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-start space-x-4 w-full">
            <div className="flex-shrink-0">
              <Info className="h-6 w-6 text-teal-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Important Information</h4>
              <p className="text-gray-600 text-sm mt-1">
                All projects undergo a verification process before being published. This typically takes 1-2 business
                days. Projects must comply with our community guidelines and terms of service.
              </p>
              <div className="mt-2">
                <Button variant="link" className="p-0 h-auto text-teal-600" asChild>
                  <Link href="/charity/ai-smart-donation">
                    Need AI assistance with your fundraising goals? <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

