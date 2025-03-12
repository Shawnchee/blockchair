import { z } from "zod";

export const userSchema = z
  .object({
    role: z.enum(["donor", "organization"], {required_error: "Role is required"}),
    fullName: z.string().min(1, "Full Name is required").or(z.literal("")).optional().nullable(),
    identityNumber: z.string().min(1, "Identity Number is required").or(z.literal("")).optional().nullable(),
    phoneNumber: z.string().min(1, "Phone Number is required"),
    organizationName: z.string().min(1, "Organization Name is required").or(z.literal("")).optional().nullable(),
    registrationNumber: z.string().min(1, "Registration Number is required").or(z.literal("")).optional().nullable(),
    contactPerson: z.string().min(1, "Contact Person is required").or(z.literal("")).optional().nullable(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine(
    (data) =>
      (data.role === "donor" && data.fullName && data.identityNumber) ||
      (data.role === "organization" && data.organizationName && data.registrationNumber && data.contactPerson),
      
    {

      message: "Required fields are missing based on the selected role",
      path: ["role"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

