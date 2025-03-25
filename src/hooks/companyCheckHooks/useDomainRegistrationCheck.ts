import { useState } from "react";

export function useRegistrationCheck() {
  const [registrationDetails, setRegistrationDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetRegistrationCheck = () => {
    setRegistrationDetails(null);
    setError(null)
  }

  const checkRegistration = async (url: string): Promise<any | null> => {
    if (!url) return null;
    setLoading(true);
    setError(null);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/domainRegistrationcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setRegistrationDetails(result);
      return result;
    } catch (err: any) {
      console.error("Error checking registration:", err);
      setError("Error checking registration");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registrationDetails ,loading, error, checkRegistration, resetRegistrationCheck };
}