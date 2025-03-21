import { OpenAI } from "openai"
import { createClient } from "@supabase/supabase-js"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// List of categories that should bypass the OpenAI API and use direct calculation
const BYPASS_API_CATEGORIES = [
  "Veterans",
  "Hunger",
  "Children",
  "Animal",
  "Mental",
  "Environmental",
  "Disability",
  "Senior",
]

// Function to extract the first word/item from a category string
const extractPrimaryCategory = (categoryString: string | null | undefined): string => {
  if (!categoryString) return "Uncategorized"

  try {
    // Try to parse as JSON if it looks like an array
    if (categoryString.trim().startsWith("[") && categoryString.includes(",")) {
      try {
        // First try to parse as JSON
        const parsed = JSON.parse(categoryString.replace(/'/g, '"'))
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0] || "Uncategorized"
        }
      } catch (e) {
        // If JSON parsing fails, try regex
        const arrayMatch = categoryString.match(/\[['"]?([^'"',]+)['"]?/)
        if (arrayMatch && arrayMatch[1]) {
          return arrayMatch[1].trim()
        }
      }
    }

    // If not in array format or parsing failed, just return the first word or the whole string if no spaces/commas
    return categoryString.split(/[,\s]/)[0].trim() || "Uncategorized"
  } catch (error) {
    console.error("Error extracting category:", error)
    return "Uncategorized"
  }
}

// Check if a category should bypass the OpenAI API
const shouldBypassApi = (category: string): boolean => {
  return BYPASS_API_CATEGORIES.some((bypassCategory) => category.toLowerCase().includes(bypassCategory.toLowerCase()))
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { category, charities } = body

    console.log("API request received:", { category, charityCount: charities?.length })

    // Validate input
    if (!category || !charities || !Array.isArray(charities) || charities.length === 0) {
      console.log("Invalid request data:", { category, charities })
      return Response.json({ suggestedGoal: 50000, error: "Invalid request data" })
    }

    // Special handling for categories that should bypass the OpenAI API
    if (shouldBypassApi(category)) {
      console.log(`Using direct calculation for ${category} category (bypassing OpenAI)`)
      const suggestedGoal = calculateSuggestedGoal(charities)
      return Response.json({ suggestedGoal })
    }

    try {
      // Get all records from the database
      const { data: allRecords, error } = await supabase.from("charity_donor").select("*")

      if (error) {
        console.error("Supabase query error:", error)
        // Fallback to a calculated suggestion if database query fails
        const suggestedGoal = calculateSuggestedGoal(charities)
        return Response.json({ suggestedGoal })
      }

      if (!allRecords || allRecords.length === 0) {
        console.log("No records found in database")
        // If no records, use the data provided in the request
        const suggestedGoal = calculateSuggestedGoal(charities)
        return Response.json({ suggestedGoal })
      }

      console.log(`Found ${allRecords.length} records in database`)

      // Safely access properties with fallbacks
      const safeCategory = category || "Uncategorized"

      // Filter records by primary category
      const categoryRecords = allRecords.filter((record) => {
        try {
          const recordCategory = extractPrimaryCategory(record.focusAreas)
          return recordCategory.toLowerCase() === safeCategory.toLowerCase()
        } catch (e) {
          console.error("Error filtering record:", e)
          return false
        }
      })

      console.log(`Found ${categoryRecords.length} records matching category "${safeCategory}"`)

      // If we have very few records, just use the fallback calculation
      if (categoryRecords.length < 3) {
        console.log(
          `Too few records (${categoryRecords.length}) for category "${safeCategory}", using fallback calculation`,
        )
        const suggestedGoal = calculateSuggestedGoal(charities)
        return Response.json({ suggestedGoal })
      }

      // Group by charityId to get unique charities
      const uniqueCharities = new Map()

      categoryRecords.forEach((record) => {
        try {
          const charityId = record.charityId || 0

          if (!uniqueCharities.has(charityId)) {
            uniqueCharities.set(charityId, {
              totalDonation: 0,
              donorIds: new Set(),
              donationCount: 0,
            })
          }

          const charity = uniqueCharities.get(charityId)
          charity.totalDonation += Number(record.donationAmount || 0)
          charity.donationCount += 1

          if (record.donorId) {
            charity.donorIds.add(record.donorId)
          }
        } catch (e) {
          console.error("Error processing record:", e)
        }
      })

      // Calculate statistics with safe fallbacks
      const totalCharities = uniqueCharities.size || 1 // Avoid division by zero
      let totalRaised = 0
      let totalDonors = 0
      let totalDonations = 0

      uniqueCharities.forEach((charity) => {
        totalRaised += charity.totalDonation || 0
        totalDonors += charity.donorIds.size || 0
        totalDonations += charity.donationCount || 0
      })

      const avgRaised = totalRaised / totalCharities
      const avgDonors = totalDonors / totalCharities

      // Calculate average goal (estimated as 150% of average raised)
      const avgGoal = Math.max(avgRaised * 1.5, 10000) // Minimum $10,000

      // Calculate success rate (as percentage of goal achieved)
      const successRate = (avgRaised / avgGoal) * 100

      // Prepare data for the selected charities with safe fallbacks
      const selectedStats = {
        count: charities.length,
        avgGoal: charities.reduce((sum, c) => sum + Number(c.current_goal || 0), 0) / charities.length,
        avgRaised: charities.reduce((sum, c) => sum + Number(c.funds_raised || 0), 0) / charities.length,
        avgDonors: charities.reduce((sum, c) => sum + Number(c.donorCount || 0), 0) / charities.length,
      }

      // Create a prompt for OpenAI
      const prompt = `
        You are an expert fundraising consultant for charities. Based on the following data, suggest an optimal fundraising goal for charities in the "${safeCategory}" category.
        
        Category Statistics:
        - Total charities in this category: ${totalCharities}
        - Average fundraising goal: $${Math.round(avgGoal).toLocaleString()}
        - Average funds raised: $${Math.round(avgRaised).toLocaleString()}
        - Success rate: ${Math.round(successRate)}%
        - Average donors per charity: ${Math.round(avgDonors)}
        
        Selected Charities Statistics:
        - Number of selected charities: ${selectedStats.count}
        - Average current goal: $${Math.round(selectedStats.avgGoal).toLocaleString()}
        - Average funds raised: $${Math.round(selectedStats.avgRaised).toLocaleString()}
        - Average donors per charity: $${Math.round(selectedStats.avgDonors)}
        
        Additional context:
        - The charities in this category focus on: ${safeCategory}
        - The average donation amount is: $${totalDonors > 0 ? Math.round(totalRaised / totalDonations).toLocaleString() : "Unknown"}
        
        Please analyze this data and provide:
        1. A single recommended fundraising goal amount (just the number) that would be optimal for charities in this category
        2. Keep your response concise and only return the number with no additional text or explanation
      `

      console.log("Calling OpenAI API...")

      try {
        // Call OpenAI API with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("OpenAI API timeout")), 5000)
        })

        const openaiPromise = openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a fundraising analytics expert that only responds with numbers." },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 50,
        })

        // Race between the API call and the timeout
        const completion = (await Promise.race([openaiPromise, timeoutPromise])) as any

        // Extract the suggested goal from the response
        const responseText = completion.choices[0].message.content || ""
        console.log("OpenAI response:", responseText)

        // Parse the number from the response
        const suggestedGoalMatch = responseText.match(/\d[\d,]*/g)
        let suggestedGoal = 50000 // Default fallback

        if (suggestedGoalMatch && suggestedGoalMatch.length > 0) {
          // Remove commas and convert to number
          suggestedGoal = Number.parseInt(suggestedGoalMatch[0].replace(/,/g, ""), 10)
        }

        console.log("Suggested goal:", suggestedGoal)
        return Response.json({ suggestedGoal })
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError)

        // Fallback to a calculated suggestion if OpenAI fails
        const suggestedGoal = calculateSuggestedGoal(charities)
        console.log("Fallback suggested goal:", suggestedGoal)
        return Response.json({ suggestedGoal })
      }
    } catch (dbError) {
      console.error("Database processing error:", dbError)

      // Fallback to a calculated suggestion if database processing fails
      const suggestedGoal = calculateSuggestedGoal(charities)
      console.log("Fallback suggested goal:", suggestedGoal)
      return Response.json({ suggestedGoal })
    }
  } catch (error) {
    console.error("General error in API route:", error)
    // Always return a valid response, even in case of errors
    return Response.json({
      suggestedGoal: 50000, // Default fallback goal
      error: "Failed to process request",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

// Fallback function to calculate a suggested goal without OpenAI
function calculateSuggestedGoal(charities) {
  try {
    // Calculate average funds raised
    const totalRaised = charities.reduce((sum, c) => sum + Number(c.funds_raised || 0), 0)
    const avgRaised = totalRaised / charities.length || 10000 // Default if no data

    // Set goal to 150% of current funds raised, with minimum and maximum values
    const suggestedGoal = Math.max(
      Math.min(
        Math.round(avgRaised * 1.5),
        1000000, // Maximum $1M
      ),
      10000, // Minimum $10K
    )

    return suggestedGoal
  } catch (error) {
    console.error("Error in fallback calculation:", error)
    return 50000 // Default if all else fails
  }
}

