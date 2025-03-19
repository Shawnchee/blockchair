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

  const runAIAnalysis = async (regResult: any, sslResult: any, scrapeResult: any): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting AI analysis with:", {
        scrapedContent: scrapeResult,
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
          trustworthinessScore: parsedResult.trustworthinessScore || 0,
          overallRiskLevel: parsedResult.overallRiskLevel || "Low",
          keyFindings: {
            domainAge: parsedResult.keyFindings?.domainAge || "Unknown",
            sslCertificate: parsedResult.keyFindings?.sslCertificate || "Unknown",
            registrantVisibility: parsedResult.keyFindings?.registrantVisibility || "Unknown",
            aboutUsCompleteness: parsedResult.keyFindings?.aboutUsCompleteness || "Unknown",
            plagiarismRisk: parsedResult.keyFindings?.plagiarismRisk || "Unknown",
          },
          redFlags: parsedResult.redFlags || [],
          finalRecommendation: parsedResult.finalRecommendation || "No recommendation available.",
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