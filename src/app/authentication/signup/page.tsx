"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file_upload"
import supabase from "@/utils/supabase/client"
import { userSchema } from "@/services/formValidationSchemas"
import { z } from "zod"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [tab, setTab] = useState("donor")
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Basic info
    role: tab,
    email: "",
    password: "",
    confirmPassword: "",

    // Donor fields
    fullName: "",
    identityNumber: "",
    phoneNumber: "",
    address: "",
    governmentId: null as File | null,
    sourceOfFunds: "",

    // Organization fields
    organizationName: "",
    registrationNumber: "",
    contactPerson: "",
    websiteUrl: "",
    businessRegistrationDoc: null as File | null,
    operatingLicense: null as File | null,
    bankStatements: null as File | null,
    taxIdDocuments: null as File | null,
    proofOfAddress: null as File | null,
    keyIndividualsId: null as File | null,
  })
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData({ ...formData, [fieldName]: file })
  }

  const handleTabChange = (value: string) => {
    setTab(value)
    setFormData({ ...formData, role: value })
    setStep(1) // Reset to first step when changing tabs
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file) return ""

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const uploadTask = supabase.storage.from("user-documents").upload(filePath, file);

    uploadTask.then(({ error: uploadError, data }) => {
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      setUploadProgress((prev) => ({
        ...prev,
        [path]: 100, // Assume 100% progress after successful upload
      }));
      return data;
    });

    // Error handling is already managed in the uploadTask.then block

    return filePath
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    formData.role = tab

    try {
      // Validate form data with Zod
      userSchema.parse(formData)

      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      const userId = authData.user?.id
      if (!userId) {
        throw new Error("Failed to create user account")
      }

      // Upload files and get paths
      const uploadTasks: Record<string, string> = {}

      if (tab === "donor") {
        if (formData.governmentId) {
          uploadTasks.governmentIdPath = await uploadFile(formData.governmentId, `donors/${userId}/government-id`)
        }
      } else {
        // Organization file uploads
        if (formData.businessRegistrationDoc) {
          uploadTasks.businessRegistrationDocPath = await uploadFile(
            formData.businessRegistrationDoc,
            `organizations/${userId}/business-registration`,
          )
        }

        if (formData.operatingLicense) {
          uploadTasks.operatingLicensePath = await uploadFile(
            formData.operatingLicense,
            `organizations/${userId}/operating-license`,
          )
        }

        if (formData.bankStatements) {
          uploadTasks.bankStatementsPath = await uploadFile(
            formData.bankStatements,
            `organizations/${userId}/bank-statements`,
          )
        }

        if (formData.taxIdDocuments) {
          uploadTasks.taxIdDocumentsPath = await uploadFile(formData.taxIdDocuments, `organizations/${userId}/tax-id`)
        }

        if (formData.proofOfAddress) {
          uploadTasks.proofOfAddressPath = await uploadFile(
            formData.proofOfAddress,
            `organizations/${userId}/proof-of-address`,
          )
        }

        if (formData.keyIndividualsId) {
          uploadTasks.keyIndividualsIdPath = await uploadFile(
            formData.keyIndividualsId,
            `organizations/${userId}/key-individuals`,
          )
        }
      }

      // Insert user data into the Users table
      const { error: userError } = await supabase.from("users").insert([
        {
          id: userId,
          email: formData.email,
          role: tab,
          fullname: formData.fullName || null,
          identitynumber: formData.identityNumber || null,
          phonenumber: formData.phoneNumber,
          address: formData.address || null,
          government_id_path: uploadTasks.governmentIdPath || null,
          source_of_funds: formData.sourceOfFunds || null,

          organizationname: tab === "organization" ? formData.organizationName : null,
          registrationnumber: tab === "organization" ? formData.registrationNumber : null,
          contactperson: tab === "organization" ? formData.contactPerson : null,
          website_url: tab === "organization" ? formData.websiteUrl : null,
          business_registration_doc_path: uploadTasks.businessRegistrationDocPath || null,
          operating_license_path: uploadTasks.operatingLicensePath || null,
          bank_statements_path: uploadTasks.bankStatementsPath || null,
          tax_id_documents_path: uploadTasks.taxIdDocumentsPath || null,
          proof_of_address_path: uploadTasks.proofOfAddressPath || null,
          key_individuals_id_path: uploadTasks.keyIndividualsIdPath || null,
        },
      ])

      if (userError) {
        throw new Error(userError.message)
      }

      // Redirect to login page after successful signup
      router.push("/authentication/login")
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    if (tab === "donor") {
      // Donor steps
      switch (step) {
        case 1:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )
        case 2:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="identityNumber">Identity Number</Label>
                  <Input
                    id="identityNumber"
                    type="text"
                    value={formData.identityNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} required />
                </div>
              </div>
            </>
          )
        case 3:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Verification</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea id="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="governmentId">Government-Issued ID (for larger donations)</Label>
                  <FileUpload
                    id="governmentId"
                    onFileChange={(file: any) => handleFileChange("governmentId", file)}
                    progress={uploadProgress["donors/government-id"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a scan or photo of your passport, driver's license, or national ID
                  </p>
                </div>
                <div>
                  <Label htmlFor="sourceOfFunds">Source of Funds Declaration (for high-value donations)</Label>
                  <Textarea
                    id="sourceOfFunds"
                    value={formData.sourceOfFunds}
                    onChange={handleChange}
                    placeholder="Please describe the source of funds for high-value donations"
                  />
                </div>
              </div>
            </>
          )
        default:
          return null
      }
    } else {
      // Organization steps
      switch (step) {
        case 1:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )
        case 2:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Organization Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    type="text"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    type="text"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input id="websiteUrl" type="url" value={formData.websiteUrl} onChange={handleChange} />
                </div>
              </div>
            </>
          )
        case 3:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Registration Documents</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessRegistrationDoc">Business Registration Documents</Label>
                  <FileUpload
                    id="businessRegistrationDoc"
                    onFileChange={(file: any) => handleFileChange("businessRegistrationDoc", file)}
                    progress={uploadProgress["organizations/business-registration"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload certificate of incorporation or registration
                  </p>
                </div>
                <div>
                  <Label htmlFor="operatingLicense">Operating License</Label>
                  <FileUpload
                    id="operatingLicense"
                    onFileChange={(file: any) => handleFileChange("operatingLicense", file)}
                    progress={uploadProgress["organizations/operating-license"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a copy of your valid operating or business license
                  </p>
                </div>
                <div>
                  <Label htmlFor="address">Organization Address</Label>
                  <Textarea id="address" value={formData.address} onChange={handleChange} required />
                </div>
              </div>
            </>
          )
        case 4:
          return (
            <>
              <h2 className="text-2xl font-semibold mb-4">Financial & Verification Documents</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bankStatements">Bank Statements or Financial Records</Label>
                  <FileUpload
                    id="bankStatements"
                    onFileChange={(file: any) => handleFileChange("bankStatements", file)}
                    progress={uploadProgress["organizations/bank-statements"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload recent bank statements or financial documents
                  </p>
                </div>
                <div>
                  <Label htmlFor="taxIdDocuments">Tax Identification Documents</Label>
                  <FileUpload
                    id="taxIdDocuments"
                    onFileChange={(file: any) => handleFileChange("taxIdDocuments", file)}
                    progress={uploadProgress["organizations/tax-id"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload tax ID or VAT registration certificate</p>
                </div>
                <div>
                  <Label htmlFor="proofOfAddress">Proof of Address</Label>
                  <FileUpload
                    id="proofOfAddress"
                    onFileChange={(file: any) => handleFileChange("proofOfAddress", file)}
                    progress={uploadProgress["organizations/proof-of-address"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload utility bills or other official documents showing the registered address
                  </p>
                </div>
                <div>
                  <Label htmlFor="keyIndividualsId">Identity Verification for Key Individuals</Label>
                  <FileUpload
                    id="keyIndividualsId"
                    onFileChange={(file: any) => handleFileChange("keyIndividualsId", file)}
                    progress={uploadProgress["organizations/key-individuals"] || 0}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload identification for directors, beneficial owners, or authorized signatories
                  </p>
                </div>
              </div>
            </>
          )
        default:
          return null
      }
    }
  }

  const totalSteps = tab === "donor" ? 3 : 4

  return (
    <div className="grid md:grid-cols-2 items-center min-h-screen">
      <div className="hidden md:block md:w-full md:h-full md:bg-slate-900"></div>
      <div className="flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-bold">Create an account</h1>
              <p className="text-gray-500 text-lg">Sign up to get started</p>

              <Tabs value={tab} onValueChange={handleTabChange} className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="donor">Donor</TabsTrigger>
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="w-full mt-4">
                <div className="flex justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      Step {step} of {totalSteps}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-8 rounded-full ${
                          i + 1 === step ? "bg-primary" : i + 1 < step ? "bg-primary/60" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                  {renderStepContent()}
{/* 
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )} */}

                  <div className="flex justify-between pt-4">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {step < totalSteps ? (
                      <Button type="button" onClick={nextStep}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    )}
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <a href="/authentication/login" className="text-primary hover:underline text-sm">
                    Already have an account? Sign In
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

