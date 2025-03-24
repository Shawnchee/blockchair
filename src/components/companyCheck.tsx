"use client"

import { useState } from "react"
import type { IResolvedValues } from "@/utils/ssl-cert/SSLChecker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

import { COMPANY_CHECK_TOOLTIPS } from "@/constants/tooltips";
import { useAIAnalysis } from "@/hooks/companyCheckHooks/useAIAnalysis"
import { useRegistrationCheck } from "@/hooks/companyCheckHooks/useDomainRegistrationCheck"
import { useScrape } from "@/hooks/companyCheckHooks/useScrape"
import { useSSLCheck } from "@/hooks/companyCheckHooks/useSSLCheck"
import { useCompanyRegistrationCheck } from "@/hooks/companyCheckHooks/useCompanyRegistration"

// import { SYSTEM_ROLE, EVALUATION_CRITERIA, STRUCTURED_OUTPUT_PROMPT } from "@/constants/openAICompanyCheckPrompts"
// import { companyCheckSchema } from "@/services/companyCheckSchema"
// import { zodResponseFormat } from "openai/helpers/zod"

export default function CompanyCheck() {
  // const [registrationDetails, setRegistrationDetails] = useState<any | null>(null)
  // const [scrapedContent, setScrapedContent] = useState<any | null>("")
  // const [sslDetails, setSSLDetails] = useState<IResolvedValues | null>(null)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeLoader, setActiveLoader] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  const { checkRegistration, resetRegistrationCheck } = useRegistrationCheck()
  const { checkSSL, resetSSLCheck } = useSSLCheck()
  const { scrapeWebsite, resetScrape } = useScrape()
  const { checkCompanyRegistration, resetCompanyRegistrationCheck } = useCompanyRegistrationCheck()
  const { finalResult, runAIAnalysis, resetAIAnalysis } = useAIAnalysis()

  const runAllChecksAndAnalyze = async () => {
    if (!url) return

    const registrationNumber = "FC029257"
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    setUrl(normalizedUrl)

    setLoading(true)
    setActiveLoader("all")

    try {
      // Run checks sequentially
      setActiveLoader("registration")
      const regResult = await checkRegistration(normalizedUrl)

      setActiveLoader("company")
      const companyResult = await checkCompanyRegistration(registrationNumber)
      
      setActiveLoader("ssl")
      const sslResult = await checkSSL(normalizedUrl)
      
      setActiveLoader("content")
      const scrapeResult = await scrapeWebsite(normalizedUrl)

      

      console.log("All checks completed:", { regResult, companyResult, sslResult, scrapeResult })

      // Update loader state to show AI is processing
      setActiveLoader("ai")

      // Run AI check
      await runAIAnalysis(regResult, companyResult, sslResult, scrapeResult)
    } catch (error) {
      console.error("Error running checks or AI analysis:", error)
    } finally {
      setLoading(false)
      setActiveLoader(null)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "text-red-500 bg-red-100"
      case "medium":
        return "text-amber-500 bg-amber-100"
      case "low":
        return "text-green-500 bg-green-100"
      default:
        return "text-blue-500 bg-blue-100"
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 70) return "bg-green-500"
    if (score > 40) return "bg-amber-500"
    return "bg-red-500"
  }

  const getScoreIcon = (score: number) => {
    if (score > 70) return <ShieldCheck className="h-8 w-8 text-green-500" />
    if (score > 40) return <Shield className="h-8 w-8 text-amber-500" />
    return <ShieldAlert className="h-8 w-8 text-red-500" />
  }

  const resetAllState = () => {
    setUrl("")
    setActiveTab("summary");
    resetAIAnalysis()
    resetRegistrationCheck()
    resetScrape()
    resetSSLCheck()
    resetCompanyRegistrationCheck()
    setOpen(false);
    setTimeout(() => {
      setOpen(true);
    }, 100);
  }
  
  const registrationNumber = "FC029257"

  return (
    <div className="w-full">
      {/* Button to open the dialog */}
      <Button onClick={() => setOpen(true)} className=" flex items-center gap-2 w-full cursor-pointer h-full text-3xl">
        <Shield className="!h-6 !w-6" />
        Run Company Check
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Company Check
            </DialogTitle>
            <DialogDescription>
              Enter a URL to evaluate a company's trustworthiness based on registration details, SSL certificate, and
              website content.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Input for URL with run button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="url"
                placeholder="Enter URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={runAllChecksAndAnalyze} disabled={loading || !url} className="whitespace-nowrap">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {activeLoader === "registration" && "Checking registration..."}
                    {activeLoader === "company" && "Checking company registration..."}
                    {activeLoader === "ssl" && "Checking SSL..."}
                    {activeLoader === "content" && "Scraping content..."}
                    {activeLoader === "ai" && "Analyzing..."}
                    {activeLoader === "all" && "Running checks..."}
                  </>
                ) : (
                  "Run Check"
                )}
              </Button>
            </div>

            {/* Display final result */}
            {finalResult && (
              <div className="mt-4">
                <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Website Details</TabsTrigger>
                    <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary" className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Score Card */}
                      <Card className="flex-1">
                      <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            Trustworthiness Score
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px] p-4">
                                  <p>{COMPANY_CHECK_TOOLTIPS.trustworthinessScore}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl font-bold">{finalResult.trustworthinessScore}%</span>
                            {getScoreIcon(finalResult.trustworthinessScore)}
                          </div>
                          <Progress
                            value={finalResult.trustworthinessScore}
                            className={`h-2 ${getScoreColor(finalResult.trustworthinessScore)}`}
                          />
                        </CardContent>
                      </Card>

                      {/* Risk Level Card */}
                      <Card className="flex-1">
                      <CardHeader className="pb-2">
  <CardTitle className="text-lg flex items-center gap-2">
    Risk Level
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] p-4">
          <p>{COMPANY_CHECK_TOOLTIPS.riskLevel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </CardTitle>
</CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-lg px-3 py-1 ${getRiskColor(finalResult.overallRiskLevel)}`}>
                              {finalResult.overallRiskLevel}
                            </Badge>
                            {finalResult.overallRiskLevel?.toLowerCase() === "low" ? (
                              <CheckCircle className="h-8 w-8 text-green-500" />
                            ) : (
                              <AlertCircle className="h-8 w-8 text-amber-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Red Flags Card */}
                    <Card>
                      <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
  Red Flags
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.redFlags}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</CardTitle>
                        <CardDescription>Issues that require attention</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {finalResult?.redFlags?.length > 0 ? (
                          <ul className="space-y-2">
                            {finalResult.redFlags.map((flag: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span>No red flags identified</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details">
  <Card>
    <CardHeader>
    <CardTitle className="flex items-center gap-2">
  Website Details
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>Detailed analysis of website security, content quality, and verification factors.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</CardTitle>
      <CardDescription>Comprehensive analysis of website verification factors</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Company Details Section - New Structure */}
      {finalResult?.companyDetails && (
        <div className="border rounded-md p-4">
<h3 className="font-semibold text-base mb-3 flex items-center gap-2">
  Company Information
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.companyInformation}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</h3>          
          {/* Company Name */}
          {finalResult.companyDetails.name && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Organization Name</h4>
              <p className="font-semibold text-lg">{finalResult.companyDetails.name}</p>
            </div>
          )}
          
          {/* Registration Information */}
          {finalResult.companyDetails.registration && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Registration Status</h4>
                <Badge className={`${
                  finalResult.companyDetails.registration.status === "Verified" 
                    ? "bg-green-100 text-green-800" 
                    : finalResult.companyDetails.registration.status === "Unverified"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                }`}>
                  {finalResult.companyDetails.registration.status || "N/A"}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Jurisdiction</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.jurisdiction || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Registration Number</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.registrationNumber || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Incorporation Date</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.incorporationDate || "N/A"}</p>
              </div>
              
              {/* New Fields */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Registration Authority</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.registrationAuthority || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Business Type</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.businessType || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tax Exempt Status</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.taxExemptStatus || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Headquarters</h4>
                <p className="font-semibold">{finalResult.companyDetails.registration.headquarters || "N/A"}</p>
              </div>
            </div>
          )}
          
          {/* Official Website */}
          {finalResult.companyDetails.officialWebsite && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Official Website</h4>
              <a href={finalResult.companyDetails.officialWebsite} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-600 hover:underline font-semibold">
                {finalResult.companyDetails.officialWebsite}
              </a>
            </div>
          )}
          
          {/* Domain Details */}
          {finalResult.companyDetails.domainDetails && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Domain Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h5 className="text-xs text-muted-foreground">Domain Age</h5>
                  <p className="font-semibold">{finalResult.companyDetails.domainDetails.age || "N/A"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs text-muted-foreground">Registrant Visibility</h5>
                  <p className="font-semibold">{finalResult.companyDetails.domainDetails.registrantVisibility || "N/A"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs text-muted-foreground">Hosting Country</h5>
                  <p className="font-semibold">{finalResult.companyDetails.domainDetails.hostingCountry || "N/A"}</p>
                </div>
                
                {/* SSL Certificate */}
                {finalResult.companyDetails.domainDetails.sslCertificate && (
                  <div>
                    <h5 className="text-xs text-muted-foreground">SSL Certificate</h5>
                    <div>
                      <Badge className={`mb-1 ${
                        finalResult.companyDetails.domainDetails.sslCertificate.status === "Secure" 
                          ? "bg-green-100 text-green-800" 
                          : finalResult.companyDetails.domainDetails.sslCertificate.status === "Expiring Soon"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {finalResult.companyDetails.domainDetails.sslCertificate.status}
                      </Badge>
                      
                      {finalResult.companyDetails.domainDetails.sslCertificate.validUntil && (
                        <p className="text-sm mt-1">Valid until: {finalResult.companyDetails.domainDetails.sslCertificate.validUntil}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Content Credibility Section - New Structure */}
      {finalResult?.contentCredibility && (
        <div className="border rounded-md p-4">
<h3 className="font-semibold text-base mb-3 flex items-center gap-2">
  Content Credibility
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.contentCredibility}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</h3>          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">About Us Completeness</h4>
              <Badge className={`${
                finalResult.contentCredibility.aboutUsCompleteness === "Complete" || finalResult.contentCredibility.aboutUsCompleteness === "Detailed"
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"
              }`}>
                {finalResult.contentCredibility.aboutUsCompleteness}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Contact Information</h4>
              <Badge className={`${
                finalResult.contentCredibility.contactInfo === "Verified" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"
              }`}>
                {finalResult.contentCredibility.contactInfo}
              </Badge>
            </div>
            
            {/* Known Partners */}
            {finalResult.contentCredibility.knownPartners && 
             finalResult.contentCredibility.knownPartners.length > 0 && (
              <div className="col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Known Partners</h4>
                <div className="flex flex-wrap gap-2">
                  {finalResult.contentCredibility.knownPartners.map((partner: any, index: any) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Media Coverage */}
            {finalResult.contentCredibility.mediaCoverage && (
              <div className="col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Media Coverage</h4>
                {Array.isArray(finalResult.contentCredibility.mediaCoverage) ? (
                  <div className="flex flex-wrap gap-2">
                    {finalResult.contentCredibility.mediaCoverage.map((media: any, index: any) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-800">
                        {media}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p>{finalResult.contentCredibility.mediaCoverage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Financial Transparency Section - New Structure */}
      {finalResult?.financialTransparency && (
        <div className="border rounded-md p-4">
<h3 className="font-semibold text-base mb-3 flex items-center gap-2">
  Financial Transparency
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.financialTransparency}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</h3>          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Records Available</h4>
              <Badge className={`${
                finalResult.financialTransparency.recordsAvailable === "Yes" 
                  ? "bg-green-100 text-green-800" 
                  : finalResult.financialTransparency.recordsAvailable === "Limited"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }`}>
                {finalResult.financialTransparency.recordsAvailable}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Latest Filing Date</h4>
              <p className="font-semibold">{finalResult.financialTransparency.latestFilingDate || "N/A"}</p>
            </div>
            
            {/* Annual Revenue */}
            {finalResult.financialTransparency.annualRevenue && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Annual Revenue</h4>
                <p className="font-semibold">{finalResult.financialTransparency.annualRevenue}</p>
              </div>
            )}
            
            {/* Public Financial Reports */}
            {finalResult.financialTransparency.publicFinancialReports && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Public Financial Reports</h4>
                <Badge className={finalResult.financialTransparency.publicFinancialReports === "Available" ? 
                  "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {finalResult.financialTransparency.publicFinancialReports}
                </Badge>
              </div>
            )}
            
            {/* Reported Donors */}
            {finalResult.financialTransparency.reportedDonors && 
             finalResult.financialTransparency.reportedDonors.length > 0 && (
              <div className="col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Reported Donors</h4>
                <div className="flex flex-wrap gap-2">
                  {finalResult.financialTransparency.reportedDonors.map((donor: any, index: any) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {donor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Financial Red Flags */}
            {finalResult.financialTransparency.redFlags && 
             finalResult.financialTransparency.redFlags.length > 0 && (
              <div className="col-span-2 mt-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Financial Red Flags</h4>
                <ul className="space-y-1 list-disc pl-5">
                  {finalResult.financialTransparency.redFlags.map((flag: any, index: any) => (
                    <li key={index} className="text-red-600">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

{!finalResult.contentCredibility && finalResult?.keyFindings?.contentCredibility && (
        <div className="border rounded-md p-4">
          <h3 className="font-semibold text-base mb-3">Content Credibility (Legacy Format)</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Contact Information</h4>
              <Badge className={finalResult.keyFindings.contentCredibility.contactInfo === "Verified" ? 
                "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                {finalResult.keyFindings.contentCredibility.contactInfo}
              </Badge>
            </div>
            
            {finalResult.keyFindings.contentCredibility.knownPartners && 
             finalResult.keyFindings.contentCredibility.knownPartners.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Known Partners</h4>
                <div className="flex flex-wrap gap-2">
                  {finalResult.keyFindings.contentCredibility.knownPartners.map((partner: any, index: any) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legacy Financial Transparency */}
      {!finalResult.financialTransparency && finalResult?.keyFindings?.financialTransparency && (
        <div className="border rounded-md p-4">
          <h3 className="font-semibold text-base mb-3">Financial Transparency (Legacy Format)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Records Available</h4>
              <Badge className={`${
                finalResult.keyFindings.financialTransparency.recordsAvailable === "Yes" 
                  ? "bg-green-100 text-green-800" 
                  : finalResult.keyFindings.financialTransparency.recordsAvailable === "Limited"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }`}>
                {finalResult.keyFindings.financialTransparency.recordsAvailable}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Latest Filing Date</h4>
              <p className="font-semibold">
                {finalResult.keyFindings.financialTransparency.latestFilingDate || "N/A"}
              </p>
            </div>
            
            {finalResult.keyFindings.financialTransparency.reportedDonors && 
             finalResult.keyFindings.financialTransparency.reportedDonors.length > 0 && (
              <div className="col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Reported Donors</h4>
                <div className="flex flex-wrap gap-2">
                  {finalResult.keyFindings.financialTransparency.reportedDonors.map((donor: any, index: any) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {donor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {finalResult.keyFindings.financialTransparency.redFlags && 
             finalResult.keyFindings.financialTransparency.redFlags.length > 0 && (
              <div className="col-span-2 mt-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Financial Red Flags</h4>
                <ul className="space-y-1 list-disc pl-5">
                  {finalResult.keyFindings.financialTransparency.redFlags.map((flag: any, index: any) => (
                    <li key={index} className="text-red-600">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

                  {/* Recommendation Tab */}
<TabsContent value="recommendation">
  <Card>
    <CardHeader>
    <CardTitle className="flex items-center gap-2">
  Final Evaluation
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.finalEvaluation}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</CardTitle>
      <CardDescription>AI assessment based on all factors</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Main Recommendation */}
      <div className="border rounded-md p-4 bg-gradient-to-r from-slate-50 to-slate-100">
      <h3 className="font-semibold text-base mb-3 flex items-center">
  <Shield className="h-4 w-4 mr-2 text-slate-700" />
  Recommendation
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.recommendation}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</h3>
        
        {typeof finalResult.finalRecommendation === 'string' ? (
          <div className="p-4 border rounded-md bg-white">
            <p className="text-lg">{finalResult.finalRecommendation}</p>
          </div>
        ) : finalResult.finalRecommendation ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${
                finalResult.finalRecommendation.status === "Trusted" 
                  ? "bg-green-100" 
                  : finalResult.finalRecommendation.status === "Proceed with Caution"
                    ? "bg-amber-100"
                    : "bg-red-100"
              }`}>
                {finalResult.finalRecommendation.status === "Trusted" ? (
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                ) : finalResult.finalRecommendation.status === "Proceed with Caution" ? (
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                )}
              </div>
              
              <Badge className={`text-lg px-3 py-1 ${
                finalResult.finalRecommendation.status === "Trusted" 
                  ? "bg-green-100 text-green-800" 
                  : finalResult.finalRecommendation.status === "Proceed with Caution"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }`}>
                {finalResult.finalRecommendation.status}
              </Badge>
            </div>
            
            <div className="p-4 border rounded-md bg-white">
              <p className="text-lg leading-relaxed">{finalResult.finalRecommendation.explanation}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 border rounded-md bg-muted/30">
            <p className="text-muted-foreground">No recommendation available</p>
          </div>
        )}
      </div>
      
      {/* AI Score Adjustment */}
      {finalResult?.aiLegitimacyOverride && (
        <div className="border rounded-md p-4 bg-indigo-50">
          <h3 className="font-semibold text-base mb-3 flex items-center">
  <Shield className="h-4 w-4 mr-2 text-indigo-700" />
  AI Score Adjustment
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.aiScoreAdjustment}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalResult.aiLegitimacyOverride.adjustedScore && (
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-md">
                <span className="text-sm text-muted-foreground mb-1">Original Score</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-slate-100 text-slate-800 text-lg px-2 py-1">
                    {finalResult.trustworthinessScore}%
                  </Badge>
                  {getScoreIcon(finalResult.trustworthinessScore)}
                </div>
              </div>
            )}
            
            {finalResult.aiLegitimacyOverride.adjustedScore && (
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-md">
                <span className="text-sm text-muted-foreground mb-1">Adjusted Score</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-800 text-lg font-bold px-2 py-1">
                    {finalResult.aiLegitimacyOverride.adjustedScore}%
                  </Badge>
                  {getScoreIcon(finalResult.aiLegitimacyOverride.adjustedScore)}
                </div>
              </div>
            )}
            
            {finalResult.aiLegitimacyOverride.overrideReason && (
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Adjustment Reasoning</h4>
                <div className="p-3 bg-white rounded-md text-sm leading-relaxed">
                  {finalResult.aiLegitimacyOverride.overrideReason}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Key Risk Factors */}
      {finalResult?.redFlags && finalResult.redFlags.length > 0 && (
        <div className="border rounded-md p-4">
          <h3 className="font-semibold text-base mb-3 flex items-center">
  <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
  Risk Factors
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] p-4">
        <p>{COMPANY_CHECK_TOOLTIPS.riskFactors}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</h3>
          <ul className="space-y-2">
            {finalResult.redFlags.map((flag: string, index: number) => (
              <li key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            {finalResult && (
              <Button
                variant="secondary"
                onClick={resetAllState}
              >
                New Check
              </Button>
            )}
            
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
