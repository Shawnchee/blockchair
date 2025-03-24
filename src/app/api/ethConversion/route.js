const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/convert/eth-myr/:ethAmount", async (req, res) => {
  try {
    const ethAmount = parseFloat(req.params.ethAmount); // Get ETH amount from the URL

    if (isNaN(ethAmount) || ethAmount <= 0) {
      return res.status(400).json({ error: "Invalid ETH amount" });
    }

    // Fetch ETH price in MYR from CoinGecko
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr"
    );

    const ethToMyr = response.data.ethereum.myr; // Get ETH to MYR rate
    const convertedPrice = ethAmount * ethToMyr; // Convert ETH to MYR

    res.json({ ethAmount, myrPrice: convertedPrice });
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    res.status(500).json({ error: "Failed to fetch ETH price" });
  }
});

module.exports = router;
