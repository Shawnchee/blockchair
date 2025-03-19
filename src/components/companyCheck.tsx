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
import { useAIAnalysis } from "@/hooks/companyCheckHooks/useAIAnalysis"
import { useRegistrationCheck } from "@/hooks/companyCheckHooks/useRegistrationCheck"
import { useScrape } from "@/hooks/companyCheckHooks/useScrape"
import { useSSLCheck } from "@/hooks/companyCheckHooks/useSSLCheck"

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
  const { finalResult, runAIAnalysis, resetAIAnalysis } = useAIAnalysis()

  const runAllChecksAndAnalyze = async () => {
    if (!url) return

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    setUrl(normalizedUrl)

    setLoading(true)
    setActiveLoader("all")

    try {
      // Run checks sequentially
      setActiveLoader("registration")
      const regResult = await checkRegistration(normalizedUrl)
      
      setActiveLoader("ssl")
      const sslResult = await checkSSL(normalizedUrl)
      
      setActiveLoader("content")
      const scrapeResult = await scrapeWebsite(normalizedUrl)

      console.log("All checks completed:", { regResult, sslResult, scrapeResult })

      // Update loader state to show AI is processing
      setActiveLoader("ai")

      // Run AI check
      await runAIAnalysis(regResult, sslResult, scrapeResult)
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
    setOpen(false);
    setTimeout(() => {
      setOpen(true);
    }, 100);
  }

  return (
    <div className="w-full">
      {/* Button to open the dialog */}
      <Button onClick={() => setOpen(true)} className="mb-4 flex items-center gap-2" size="lg">
        <Shield className="h-4 w-4" />
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
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary" className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Score Card */}
                      <Card className="flex-1">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Trustworthiness Score</CardTitle>
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
                          <CardTitle className="text-lg">Risk Level</CardTitle>
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
                        <CardTitle className="text-lg">Red Flags</CardTitle>
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

                  {/* Details Tab */}
                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Findings</CardTitle>
                        <CardDescription>Detailed analysis of company verification factors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Domain Age</h4>
                            <p className="font-semibold">{finalResult?.keyFindings?.domainAge || "N/A"}</p>
                          </div>

                          <div className="border rounded-md p-3">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">SSL Certificate</h4>
                            <p className="font-semibold">{finalResult?.keyFindings?.sslCertificate || "N/A"}</p>
                          </div>

                          <div className="border rounded-md p-3">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Registrant Visibility</h4>
                            <p className="font-semibold">{finalResult?.keyFindings?.registrantVisibility || "N/A"}</p>
                          </div>

                          <div className="border rounded-md p-3">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">About Us Completeness</h4>
                            <p className="font-semibold">{finalResult?.keyFindings?.aboutUsCompleteness || "N/A"}</p>
                          </div>

                          <div className="border rounded-md p-3 md:col-span-2">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Plagiarism Risk</h4>
                            <p className="font-semibold">{finalResult?.keyFindings?.plagiarismRisk || "N/A"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Recommendation Tab */}
                  <TabsContent value="recommendation">
                    <Card>
                      <CardHeader>
                        <CardTitle>Final Evaluation</CardTitle>
                        <CardDescription>AI assessment based on all factors</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 border rounded-md bg-muted/50">
                          <p className="text-lg">{finalResult.finalRecommendation}</p>
                        </div>
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
