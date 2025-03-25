import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/utils/puppeteer/scrape";

// Handle GET requests (optional, for testing)
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Hello World" }, {
    headers: {
      "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow GET, POST, and OPTIONS methods
      "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
    },
  });
}

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    // Perform the scraping operation
    const result = await scrapeWebsite(url);
    console.log("Scraping website:", url);

    return NextResponse.json({ result }, {
      headers: {
        "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow GET, POST, and OPTIONS methods
        "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
      },
    });
  } catch (error) {
    console.error("Error scraping website", error);
    return NextResponse.json({ error: "Failed to scrape website" }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
      },
    });
  }
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow GET, POST, and OPTIONS methods
      "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
    },
  });
}