import { useState } from "react";

export function useScrape() {
  const [scrapedContent, setScrapedContent] = useState<any | null>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetScrape = () => {
    setScrapedContent(null);
    setError(null)
    }

  const scrapeWebsite = async (url: string): Promise<any | null> => {
    if (!url) return null;
    setLoading(true);
    setError(null);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
          "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
          "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
         },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const result = await response.json();
      setScrapedContent(result);
      return result;
    } catch (err: any) {
      console.error("Error scraping website:", err);
      setError("Error scraping website content");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scrapedContent, loading, error, scrapeWebsite, resetScrape };
}