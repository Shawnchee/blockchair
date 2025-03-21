import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(req: NextRequest) {
  try {
    const { messages, response_format } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.2,
    });

    return NextResponse.json({ companyCheckAnalysis: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return NextResponse.json({ error: "Failed to fetch OpenAI response" }, { status: 500 });
  }
}