import { useState } from "react";

export function useCompanyRegistrationCheck() {
  const [companyRegistrationDetails, setCompanyRegistrationDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetCompanyRegistrationCheck = () => {
    setCompanyRegistrationDetails(null);
    setError(null)
  }

  const checkCompanyRegistration = async (registrationNumber: string): Promise<any | null> => {
    if (!registrationNumber) return null;
    setLoading(true);
    setError(null);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    try {
      const response = await fetch(`${baseUrl}/api/companyRegistrationCheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
          "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
          "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
        },
        body: JSON.stringify({ registrationNumber }),
      });

      if (!response.ok) {
        console.log("Network response was not ok");
      }

      const result = await response.json();
      setCompanyRegistrationDetails(result);
      return result;
    } catch (err: any) {
      console.error("Error checking registration:", err);
      setError("Error checking registration");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { companyRegistrationDetails ,loading, error, checkCompanyRegistration, resetCompanyRegistrationCheck };
}