import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/utils/supabase/client";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: NextRequest) {
  try {
    const { userDonations, allCharities } = await req.json();

    if (!userDonations || !allCharities) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract user's preferred causes from their donation history
    const userCauses = new Set<string>();
    userDonations.forEach((donation: any) => {
      if (donation.categories) {
        donation.categories.forEach((category: string) => userCauses.add(category));
      }
    });

    // Filter out charities the user has already donated to
    const userDonatedIds = new Set(userDonations.map((d: any) => d.id));
    const availableCharities = allCharities.filter((charity: any) => !userDonatedIds.has(charity.id));

    if (availableCharities.length === 0) {
      return NextResponse.json(
        { recommendations: [] },
        { headers: corsHeaders }
      );
    }

    // Prepare data for OpenAI
    const prompt = `
      I need personalized charity recommendations for a donor.

      The donor has previously supported these causes: ${Array.from(userCauses).join(", ")}.

      Here are available charity projects that the donor hasn't contributed to yet:
      ${JSON.stringify(availableCharities.map((c: any) => ({
        id: c.id,
        title: c.title,
        categories: c.categories,
        introduction: c.introduction?.substring(0, 200) + "..." || "No description available"
      })), null, 2)}

      Based on the donor's interests and the available charities, recommend the top 3 most relevant charities.
      Consider both category matches and the content of the charity descriptions.

      Return your response as a JSON array with the following structure:
      [
        {
          "id": "charity_id",
          "reason": "A brief explanation of why this charity is recommended (1-2 sentences)"
        },
        ...
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert charity recommendation system. Your goal is to match donors with causes they would be interested in based on their donation history."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const responseContent = completion.choices[0].message.content;
    let recommendations = [];

    try {
      if (responseContent) {
        const parsedResponse = JSON.parse(responseContent);

        // Handle different possible response formats
        if (Array.isArray(parsedResponse)) {
          recommendations = parsedResponse;
        } else if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
          recommendations = parsedResponse.recommendations;
        } else if (parsedResponse.results && Array.isArray(parsedResponse.results)) {
          recommendations = parsedResponse.results;
        } else {
          // Try to extract an array from any property that might be an array of objects with id and reason
          const possibleArrays = Object.values(parsedResponse).filter(val =>
            Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0].id
          );

          if (possibleArrays.length > 0) {
            recommendations = possibleArrays[0] as any[];
          }
        }
      }

      console.log("Parsed recommendations:", recommendations);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.error("Raw response:", responseContent);
      return NextResponse.json(
        { error: "Failed to parse recommendations" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Get the full charity details for the recommended IDs
    const recommendedCharities = [];
    for (const rec of recommendations) {
      const charity = availableCharities.find((c: any) => c.id.toString() === rec.id.toString());
      if (charity) {
        recommendedCharities.push({
          ...charity,
          recommendation_reason: rec.reason
        });
      }
    }

    return NextResponse.json({ recommendations: recommendedCharities }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
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
