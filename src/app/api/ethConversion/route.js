import axios from "axios";

export async function POST() {
  try {
    // Fetch ETH price in MYR from CoinGecko
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr"
    );

    // Extract ETH to MYR rate
    const ethToMyr = response.data.ethereum.myr;

    // Return the ETH to MYR price in the response
    return new Response(JSON.stringify({ myrPrice: ethToMyr }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching ETH price:", error);

    // Return an error response
    return new Response(
      JSON.stringify({ error: "Failed to fetch ETH price" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

