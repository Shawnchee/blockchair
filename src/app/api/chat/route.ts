import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import supabase from "@/utils/supabase/client";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    // Fetch all charity projects from Supabase
    const { data: charities, error } = await supabase
      .from("charity_2")
      .select("*")
      .order("id");

    if (error) {
      console.error("Error fetching charities:", error);
      return NextResponse.json(
        { error: "Failed to fetch charities" },
        { status: 500 }
      );
    }

    // Format charities for better context
    const charitiesContext = charities.map((charity) => ({
      id: charity.id,
      title: charity.title || "Unnamed Project",
      description: charity.description || "No description available",
      categories: charity.categories || [],
      total_amount: charity.total_amount || 0,
      cover_image: charity.cover_image || null,
      smart_contract_address: charity.smart_contract_address,
    }));

    // Prepare messages for OpenAI
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: `You are a charity donation assistant for BlockChair, BlockChair is an innovative, blockchain-driven web platform that redefines trust, transparency, and engagement in the world of digital charity. Harnessing the power of Ethereum (ETH) and MetaMask integration, BlockChair enables secure, verifiable, and tamper-proof donations directly to charitable causes. Our mission is to create a transparent ecosystem where donors can witness the real-world impact of their contributions, while empowering charities to operate with increased credibility and efficiency.

At the heart of BlockChair is a smart contract-based milestone release system, which ensures that funds are only disbursed when predefined project goals are met. This eliminates misuse and enhances donor confidence.

With an emphasis on AI-driven safety, analytics, and personalization, BlockChair offers a suite of intelligent tools that improve user experience, vet charitable organizations, and optimize fundraising efforts.
        
When a user expresses intent to donate to a cause (e.g., "I want to donate to education", "help children"):
1. Find the most relevant charity project that matches their interests
2. Respond with information about the charity
3. Ask if they'd like to proceed with a donation

Available charity projects: ${JSON.stringify(charitiesContext.slice(0, 5))}

For security, never reveal contract addresses or technical details.`
      },
    ];

    // Add conversation history
    if (history && history.length > 0) {
      history.forEach((entry) => {
        if (entry && entry.role && entry.content) {
          messages.push({
            role: entry.role,
            content: entry.content,
          });
        }
      });
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const assistantMessage = completion.choices[0].message.content || "";

    // Use a separate model call to analyze the intent
    const intentAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analyze if this message contains a donation intent. Extract charity names or cause categories.
          Return JSON with properties: 
          {
            "donationIntent": boolean,
            "charityName": string or null,
            "categories": array of strings or null 
          }
          
          Examples of charity names: "Helping Hands", "Clean Water Project", etc.
          Examples of categories: "education", "water", "children", "medical", "poverty", etc.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    // Parse intent analysis
    let intentData = { donationIntent: false, categories: [], charityName: null };
    try {
      const parsedContent = JSON.parse(intentAnalysis.choices[0].message.content || "{}");
      intentData = {
        donationIntent: Boolean(parsedContent.donationIntent),
        charityName: parsedContent.charityName || null,
        categories: parsedContent.categories || []
      };
      console.log("Intent analysis:", intentData);

    } catch (error) {
      console.error("Error parsing intent analysis:", error);
    }

    // Find matching charity if there's an intent
    let matchingCharity = null;
    if (intentData.donationIntent && charities.length > 0) {
      const searchTerms = [
        ...(intentData.categories || []), 
        intentData.charityName
      ].filter(Boolean).map(term => term.toLowerCase());
      
      console.log("Searching for terms:", searchTerms);
      
      // Score-based matching algorithm
      const charityScores = charities.map(charity => {
        let score = 0;
        
        // Check for direct charity name match (highest priority)
        if (intentData.charityName && 
            charity.title && 
            charity.title.toLowerCase().includes(intentData.charityName.toLowerCase())) {
          score += 100;
        }
        
        // Check categories
        if (charity.category && Array.isArray(charity.category)) {
          charity.category.forEach(cat => {
            searchTerms.forEach(term => {
              if (cat.toLowerCase().includes(term) || term.includes(cat.toLowerCase())) {
                score += 10;
              }
            });
          });
        }
        
        // Check title
        if (charity.title) {
          searchTerms.forEach(term => {
            if (charity.title.toLowerCase().includes(term)) {
              score += 5;
            }
          });
        }
        
        // Check description
        if (charity.description) {
          searchTerms.forEach(term => {
            if (charity.description.toLowerCase().includes(term)) {
              score += 3;
            }
          });
        }
        
        return { charity, score };
      });
      
      // Sort by score and get the highest
      charityScores.sort((a, b) => b.score - a.score);
      console.log("Charity scores:", charityScores.map(cs => ({
        title: cs.charity.title,
        score: cs.score
      })));
      
      // Select the highest scoring charity if it has a score > 0
      if (charityScores.length > 0 && charityScores[0].score > 0) {
        matchingCharity = charityScores[0].charity;
      }
      
      // If no match with a score, return a random charity instead of always the first one
      if (!matchingCharity && charities.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(3, charities.length));
        matchingCharity = charities[randomIndex];
      }
    }

    console.log("Selected charity:", matchingCharity?.title || "None");

    return NextResponse.json({
      message: assistantMessage,
      donationIntent: intentData.donationIntent,
      matchingCharity: matchingCharity,
    });
  } catch (error: any) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { 
        error: "Failed to process message", 
        details: error.message || "Unknown error" 
      },
      { status: 500 }
    );
  }
}