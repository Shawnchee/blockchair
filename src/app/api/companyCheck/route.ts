import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
  "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
};

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { messages, response_format } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.2,
    });

    return NextResponse.json(
      { companyCheckAnalysis: completion.choices[0].message.content },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return NextResponse.json(
      { error: "Failed to fetch OpenAI response" },
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