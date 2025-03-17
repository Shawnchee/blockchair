import { OpenAI } from "openai";

export async function POST(req) {
    console.log("🚀 analyzeTransactions API called");

    try {
        console.log("📝 Checking request body...");

        // Read raw request body
        const bodyText = await req.text();
        console.log("📜 Raw request body:", bodyText);

        // Attempt to parse JSON safely
        let transactions;
        try {
            const parsedBody = JSON.parse(bodyText);
            transactions = parsedBody.transactions;
        } catch (error) {
            console.error("❌ JSON Parsing Error:", error);
            return new Response(JSON.stringify({ error: "Invalid JSON format." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Validate `transactions` existence
        if (!transactions || !Array.isArray(transactions)) {
            console.error("🚨 Missing or invalid 'transactions' field.");
            return new Response(JSON.stringify({ error: "Missing or invalid 'transactions' field." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log("✅ Request body is valid. Proceeding to OpenAI call...");

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const prompt = `
        Analyze the following Solana transactions and determine if they resemble charity or business-related transactions.
        Provide a credibility score (0-100) and multiple comments based on patterns.

        Return the result **strictly** as a valid JSON object in this format:
          {
            "score": <integer>, 
            "comments": ["comment1", "comment2", "comment3"]
          }

        Transactions: ${JSON.stringify(transactions)}
        `;

        console.log("🔍 Sending request to OpenAI...");
        
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
        });

        console.log("📩 Raw OpenAI Response:", response);

        // Extract and validate OpenAI response
        const messageContent = response?.choices?.[0]?.message?.content?.trim();
        if (!messageContent) {
            console.error("❌ No valid response from OpenAI.");
            throw new Error("No valid response from OpenAI.");
        }

        console.log("✅ Extracted Message Content:", messageContent);

        // Ensure OpenAI response is in JSON format
        let result;
        try {
            let cleanedMessageContent = messageContent.replace(/```json|```/g, "").trim();
            result = JSON.parse(cleanedMessageContent);
            
        } catch (error) {
            console.error("❌ JSON Parsing Error (OpenAI Response):", error);
            throw new Error("Invalid response format from OpenAI.");
        }

        // Validate response structure
        if (typeof result !== "object" || !result.score || !result.comments) {
            console.error("🚨 Malformed response from OpenAI:", result);
            throw new Error("Malformed response from OpenAI.");
        }

        console.log("✅ Successfully analyzed transactions:", result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("❌ LLM analysis error:", error);

        return new Response(JSON.stringify({ error: "Failed to analyze transactions." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
