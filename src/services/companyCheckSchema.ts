import { z } from "zod";

export const companyCheckSchema = z.object({
  trustworthinessScore: z.number().min(0).max(100).optional(), // Optional field
  overallRiskLevel: z.enum(["Low", "Medium", "High"]).optional(), // Optional field
  keyFindings: z
    .object({
      domainAge: z.string().optional(), // Optional field
      sslCertificate: z.string().optional(), // Optional field
      registrantVisibility: z.enum(["Public", "Private"]).optional(), // Optional field
      aboutUsCompleteness: z.enum(["Complete", "Missing Key Details"]).optional(), // Optional field
      plagiarismRisk: z.enum(["Low", "Medium", "High"]).optional(), // Optional field
    })
    .optional(), // Make the entire keyFindings object optional
  redFlags: z.array(z.string()).optional(), // Optional field
  finalRecommendation: z.string().optional(), // Optional field
});