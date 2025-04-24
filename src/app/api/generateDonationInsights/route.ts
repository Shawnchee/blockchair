import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { donationData } = await req.json();

    // Create a detailed prompt for OpenAI
    const prompt = `
      Analyze the following donation data and generate insights:
      ${JSON.stringify(donationData, null, 2)}

      Generate three sections:
      1. Impact Statements: How these donations have made a difference
      2. Donation Patterns: Analysis of donation frequency, amounts, and preferences
      3. Future Suggestions: Recommendations for future donations based on current patterns

      Return the response in this JSON format:
      {
        "impactStatements": ["statement1", "statement2", "statement3"],
        "patterns": ["pattern1", "pattern2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Changed from gpt-4 to gpt-3.5-turbo for cost efficiency
      messages: [
        {
          role: "system",
          content: "You are an AI donation analyst that provides insights about charitable giving patterns and impact.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    const insights = JSON.parse(response || "{}");

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
