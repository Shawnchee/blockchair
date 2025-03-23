"use client"; // For Next.js Apps

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useMetaMask = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it.");
      return;
    }

    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const selectedAccount = accounts[0];

      const newSigner = await newProvider.getSigner();
      setWalletAddress(selectedAccount);
      setProvider(newProvider);
      setSigner(newSigner);

      console.log("Connected with MetaMask:", selectedAccount);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return { walletAddress, provider, signer, connectWallet };
};

export default useMetaMask;
