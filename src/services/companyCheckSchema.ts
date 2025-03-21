import { z } from "zod";

export const companyCheckSchema = z.object({
  trustworthinessScore: z.number().min(0).max(100).optional(),
  overallRiskLevel: z.enum(["Low", "Medium", "High"]).optional(),
  
  // Company Details - new consolidated section
  companyDetails: z.object({
    name: z.string().optional(),
    registration: z.object({
      status: z.enum(["Verified", "Unverified", "Not Found"]).optional(),
      jurisdiction: z.string().optional(),
      registrationNumber: z.string().optional(),
      incorporationDate: z.string().optional(),
      registrationAuthority: z.string().optional(),
      businessType: z.string().optional(),
      taxExemptStatus: z.string().optional(),
      headquarters: z.string().optional(),
    }).optional(),
    officialWebsite: z.string().optional(),
    domainDetails: z.object({
      age: z.enum(["New (<6 months)", "Moderate (1-5 years)", "Established (10+ years)"]).optional(),
      sslCertificate: z.object({
        status: z.enum(["Secure", "Expiring Soon", "Missing"]).optional(),
        validUntil: z.string().optional(),
      }).optional(),
      registrantVisibility: z.enum(["Public", "Private"]).optional(),
      hostingCountry: z.string().optional(),
    }).optional(),
  }).optional(),
  
  // Content Credibility - moved to top level
  contentCredibility: z.object({
    aboutUsCompleteness: z.enum(["Complete", "Missing Key Details", "Detailed"]).optional(),
    contactInfo: z.enum(["Verified", "Unverified"]).optional(),
    knownPartners: z.array(z.string()).optional(),
    mediaCoverage: z.union([z.string(), z.array(z.string())]).optional(),
  }).optional(),
  
  // Financial Transparency - moved to top level
  financialTransparency: z.object({
    recordsAvailable: z.enum(["Yes", "No", "Limited"]).optional(),
    latestFilingDate: z.string().optional(),
    reportedDonors: z.array(z.string()).optional(),
    annualRevenue: z.string().optional(),
    publicFinancialReports: z.enum(["Available", "Not Available"]).optional(),
    redFlags: z.array(z.string()).optional(),
  }).optional(),
  
  // AI Legitimacy Override - completely new section
  aiLegitimacyOverride: z.object({
    adjustedScore: z.number().min(0).max(100).optional(),
    overrideReason: z.string().optional(),
  }).optional(),
  
  redFlags: z.array(z.string()).optional(),
  
  // Final Recommendation
  finalRecommendation: z.union([
    z.string().optional(),
    z.object({
      status: z.enum(["Trusted", "Proceed with Caution", "High Risk"]).optional(),
      explanation: z.string().optional(),
    }).optional(),
  ]).optional(),
  
  // For backward compatibility, keep keyFindings
  keyFindings: z.object({
    companyRegistration: z.object({
      status: z.enum(["Verified", "Unverified", "Not Found"]).optional(),
      jurisdiction: z.string().optional(),
      registrationNumber: z.string().optional(),
      incorporationDate: z.string().optional(),
    }).optional(),
    domainAge: z.enum(["New (<6 months)", "Moderate (1-5 years)", "Established (10+ years)"]).optional(),
    sslCertificate: z.union([
      z.string().optional(),
      z.object({
        status: z.enum(["Secure", "Expiring Soon", "Missing"]).optional(),
        validUntil: z.string().optional(),
      }).optional(),
    ]).optional(),
    registrantVisibility: z.enum(["Public", "Private"]).optional(),
    aboutUsCompleteness: z.enum(["Complete", "Missing Key Details", "Detailed"]).optional(),
    plagiarismRisk: z.enum(["Low", "Medium", "High"]).optional(),
    contentCredibility: z.object({
      contactInfo: z.enum(["Verified", "Unverified"]).optional(),
      knownPartners: z.array(z.string()).optional(),
    }).optional(),
    financialTransparency: z.object({
      recordsAvailable: z.enum(["Yes", "No", "Limited"]).optional(),
      latestFilingDate: z.string().optional(),
      reportedDonors: z.array(z.string()).optional(),
      redFlags: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});