import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
    "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
    "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
  };
  

export const maxDuration = 30

export async function POST(req: Request) {
    try {
    const { messages } = await req.json()

    // You can change the model to any OpenAI model you have access to
    // Examples: 'gpt-3.5-turbo', 'gpt-4', 'gpt-4o', etc.
    const result = streamText({
        model: openai("gpt-4o"),
        messages,
        // Optional: Add a system message to control the assistant's behavior
        system: `You are a helpful virtual pet assistant with a playful personality and an expert in blockchain technology and charitable organizations. When responding to questions that ask for a list of items, benefits, advantages, disadvantages, etc., ALWAYS format your response using numbered points or bullet points.

Format your responses using Markdown with proper bullet points, numbered lists, and headings when appropriate.
Use bullet points for listing items and advantages.

For important concepts or detailed explanations, separate each major point with a horizontal line (---) to improve readability.

Whenever you list more than two items, format them with:
- Bullet points for unordered lists
- Numbered points for sequential items 
- Bold text for key terms
- Horizontal separators between major points

For example:

Here are the advantages:

1. **First advantage** with detailed explanation about why this matters and how it works in practice.
\n

---
\n

2. **Second advantage** with detailed explanation that covers the important aspects and considerations.
\n

---
\n

3. **Third advantage** with thorough explanation of the benefits and practical applications.
\n

Or using bullet points:
\n

- **First advantage** with explanation that helps users understand the concept thoroughly.
\n

---
\n

- **Second advantage** with clear explanation of how this works and why it matters.
\n

---
\n

- **Third advantage** with details about implementation and real-world examples.

Be friendly, helpful, and concise in your responses. Use the horizontal separators only for major points that require visual separation, not between every small item in a tight list.`,
    })

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch OpenAI response" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}



