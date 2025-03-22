import { z } from "zod"

// Update the user schema to include the new fields
export const userSchema = z
  .object({
    role: z.enum(["donor", "organization"]),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),

    // Donor fields
    fullName: z.string().optional(),
    identityNumber: z.string().optional(),
    phoneNumber: z.string().min(5, "Please enter a valid phone number"),
    address: z.string().optional(),
    governmentId: z.any().optional(),
    sourceOfFunds: z.string().optional(),

    // Organization fields
    organizationName: z.string().optional(),
    registrationNumber: z.string().optional(),
    contactPerson: z.string().optional(),
    websiteUrl: z.string().url().optional().or(z.literal("")),
    businessRegistrationDoc: z.any().optional(),
    operatingLicense: z.any().optional(),
    bankStatements: z.any().optional(),
    taxIdDocuments: z.any().optional(),
    proofOfAddress: z.any().optional(),
    keyIndividualsId: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "donor") {
        return !!data.fullName && !!data.identityNumber
      }
      return true
    },
    {
      message: "Full name and identity number are required for donors",
      path: ["fullName"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "organization") {
        return !!data.organizationName && !!data.registrationNumber && !!data.contactPerson
      }
      return true
    },
    {
      message: "Organization name, registration number, and contact person are required for organizations",
      path: ["organizationName"],
    },
  )

