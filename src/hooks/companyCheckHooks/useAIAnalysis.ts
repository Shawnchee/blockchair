import { useState } from "react";
import { SYSTEM_ROLE, EVALUATION_CRITERIA, STRUCTURED_OUTPUT_PROMPT } from "@/constants/openAICompanyCheckPrompts";
import { companyCheckSchema } from "@/services/companyCheckSchema";
import { zodResponseFormat } from "openai/helpers/zod";

export function useAIAnalysis() {
  const [finalResult, setFinalResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAIAnalysis = () => {
    setFinalResult(null);
    setError(null)
  }

  const runAIAnalysis = async (regResult: any, companyResult: any, sslResult: any, scrapeResult: any): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting AI analysis with:", {
        scrapedContent: scrapeResult,
        companyResult: companyResult,
        sslDetails: sslResult,
        registrationDetails: regResult,
      });

      const payload = {
        messages: [
          {
            role: "system",
            content: SYSTEM_ROLE,
          },
          {
            role: "user",
            content: `
            ${EVALUATION_CRITERIA}
  
            Input Data:
            ${JSON.stringify(
              {
                aboutUsContent: scrapeResult,
                sslDetails: sslResult,
                registrationDetails: regResult,
                companyDetails: companyResult,
                
              },
              null,
              2,
            )}
            ${STRUCTURED_OUTPUT_PROMPT}
            `,
          },
        ],
        response_format: zodResponseFormat(companyCheckSchema, "companyCheckAnalysis"),
      };

      const response = await fetch("/api/companyCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("AI analysis request failed");
      }

      const result = await response.json();
      console.log("Raw API Response:", result);

      // Handle different response formats
      let parsedResult;

      if (typeof result === "string") {
        try {
          parsedResult = JSON.parse(result);
          console.log("Parsed string result:", parsedResult);
        } catch (error) {
          console.error("Error parsing result as JSON string:", error);
          parsedResult = null;
        }
      } else if (result.companyCheckAnalysis) {
        parsedResult = result.companyCheckAnalysis;

        if (typeof parsedResult === "string") {
          try {
            parsedResult = JSON.parse(parsedResult);
            console.log("Parsed companyCheckAnalysis string:", parsedResult);
          } catch (error) {
            console.error("Error parsing companyCheckAnalysis as JSON:", error);
          }
        }
      } else {
        parsedResult = result;
      }

      console.log("Final Parsed Result:", parsedResult);

      if (parsedResult) {
        const completeResult = {
          // Basic fields
          trustworthinessScore: parsedResult.trustworthinessScore || 0,
          overallRiskLevel: parsedResult.overallRiskLevel || "Low",
          
          // New schema structure
          companyDetails: parsedResult.companyDetails || {
            name: null,
            registration: {
              status: "Not Found",
              jurisdiction: null,
              registrationNumber: null,
              incorporationDate: null,
              registrationAuthority: null,
              businessType: null,
              taxExemptStatus: null,
              headquarters: null
            },
            officialWebsite: null,
            domainDetails: {
              age: null,
              sslCertificate: {
                status: null,
                validUntil: null
              },
              registrantVisibility: null,
              hostingCountry: null
            }
          },
          
          contentCredibility: parsedResult.contentCredibility || {
            aboutUsCompleteness: null,
            contactInfo: null,
            knownPartners: [],
            mediaCoverage: null
          },
          
          financialTransparency: parsedResult.financialTransparency || {
            recordsAvailable: null,
            latestFilingDate: null,
            reportedDonors: [],
            annualRevenue: null,
            publicFinancialReports: null,
            redFlags: []
          },
          
          aiLegitimacyOverride: parsedResult.aiLegitimacyOverride || {
            adjustedScore: null,
            overrideReason: null
          },
          
          // Legacy fields for backward compatibility
          keyFindings: parsedResult.keyFindings || {
            // If old keyFindings doesn't exist, try to map from new structure
            companyRegistration: parsedResult.companyDetails?.registration ? {
              status: parsedResult.companyDetails.registration.status,
              jurisdiction: parsedResult.companyDetails.registration.jurisdiction,
              registrationNumber: parsedResult.companyDetails.registration.registrationNumber,
              incorporationDate: parsedResult.companyDetails.registration.incorporationDate
            } : {
              status: "Not Found",
              jurisdiction: null,
              registrationNumber: null,
              incorporationDate: null
            },
            domainAge: parsedResult.companyDetails?.domainDetails?.age || "Unknown",
            sslCertificate: parsedResult.companyDetails?.domainDetails?.sslCertificate || "Unknown",
            registrantVisibility: parsedResult.companyDetails?.domainDetails?.registrantVisibility || "Unknown",
            aboutUsCompleteness: parsedResult.contentCredibility?.aboutUsCompleteness || "Unknown",
            plagiarismRisk: "Unknown",
            contentCredibility: parsedResult.contentCredibility ? {
              contactInfo: parsedResult.contentCredibility.contactInfo,
              knownPartners: parsedResult.contentCredibility.knownPartners
            } : null,
            financialTransparency: parsedResult.financialTransparency ? {
              recordsAvailable: parsedResult.financialTransparency.recordsAvailable,
              latestFilingDate: parsedResult.financialTransparency.latestFilingDate,
              reportedDonors: parsedResult.financialTransparency.reportedDonors,
              redFlags: parsedResult.financialTransparency.redFlags
            } : null
          },
          
          redFlags: parsedResult.redFlags || [],
          finalRecommendation: parsedResult.finalRecommendation || "No recommendation available."
        };
      
        console.log("Setting final result:", completeResult);
        setFinalResult(completeResult);
        return completeResult;
      } else {
        setError("Failed to parse AI analysis result");
        return null;
      }
    } catch (err: any) {
      console.error("Error with OpenAI API:", err);
      setError(`AI analysis error: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { finalResult, loading, error, runAIAnalysis, resetAIAnalysis };
}