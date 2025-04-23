import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr";
const DEFAULT_ETH_TO_MYR = 12500; // Fallback value if API fails

export async function GET(req: NextRequest) {
  try {
    // Try to fetch the latest ETH to MYR rate from CoinGecko
    const response = await fetch(COINGECKO_API_URL, {
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store", // Don't cache the response
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.ethereum || !data.ethereum.myr) {
      throw new Error("Invalid response format from CoinGecko API");
    }

    const ethToMyr = data.ethereum.myr;

    return NextResponse.json({ 
      rate: ethToMyr,
      source: "coingecko",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching ETH to MYR rate:", error);
    
    // Return fallback value if API call fails
    return NextResponse.json({ 
      rate: DEFAULT_ETH_TO_MYR,
      source: "fallback",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
