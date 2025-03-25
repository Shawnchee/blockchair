import { NextRequest, NextResponse } from "next/server";
import { registrationCheck } from "@/utils/regCheck/domainRegistrationCheck";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
  "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
};

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    console.log("Checking registration for", url);

    const result = await registrationCheck(url);
    console.log("Registration Details:", result);

    return NextResponse.json({ result }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error checking registration", error);
    return NextResponse.json(
      { error: "Failed to check registration" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: corsHeaders,
  });
}