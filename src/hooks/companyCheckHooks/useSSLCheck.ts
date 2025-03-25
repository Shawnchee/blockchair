import { useState } from "react";
import type { IResolvedValues } from "@/utils/ssl-cert/SSLChecker";

export function useSSLCheck() {
  const [sslDetails, setSSLDetails] = useState<IResolvedValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetSSLCheck = () => {
    setSSLDetails(null);
    setError(null)
  }

  const checkSSL = async (url: string): Promise<IResolvedValues | null> => {
    if (!url) return null;
    setLoading(true);
    setError(null);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/sslcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const result = await response.json();
      console.log("SSL Result:", result);
      setSSLDetails(result);
      return result;
    } catch (err: any) {
      console.error("Error checking SSL:", err);
      setError("Error checking SSL certificate");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sslDetails, loading, error, checkSSL,resetSSLCheck };
}