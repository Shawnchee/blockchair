"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, MessageSquare, Loader2, Heart, DollarSign, CheckCircle, ExternalLink, AlertTriangle, Gift, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import getCurrentUser from "@/hooks/getCurrentUser"
import { useUserData } from "@/hooks/fetchUserData"
import Markdown from "markdown-to-jsx"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ethers } from "ethers"
// import { contractABI } from "@/lib/contract-abi"
import supabase from "@/utils/supabase/client"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  charity?: any
  donationIntent?: boolean
}

interface DonationState {
  charity: any
  amount: string
  processing: boolean
  status: "amount" | "confirming" | "processing" | "completed" | "error"
  error?: string
  txHash?: string
}

export default function ChatbotComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const currentUser = getCurrentUser()
  const [userId, setUserId] = useState("")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Donation state
  const [donationState, setDonationState] = useState<DonationState | null>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [ethToMyrRate, setEthToMyrRate] = useState<number>(8000) // Default exchange rate
  const [user, setUser] = useState<any>(null)
  const [contractAbi , setContractAbi] = useState<any>(null)

  useEffect(() => {
    if (currentUser?.id) {
      setUserId(currentUser.id)
    }
  }, [currentUser])

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError || !session) {
        console.error("No active session found:", sessionError);
        setUser(null);
        return;
      }
  
      const { user } = session;
      setUser(user);
    }
  
    fetchUserData();
  }, []);

  const { data: userData, loading: userLoading } = useUserData(userId)

  const getPet = (path: string) => {
    const bucket = "virtual-pets"
    const folder = "pet-combined"
    return `https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/${bucket}/${folder}/${path}`
  }

  const petImage = userData?.pet_owned ? getPet(userData.pet_owned) : "placeholder"

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, donationState])
  
  // Handle image loading states
  useEffect(() => {
    // Skip if no petImage or it's just the placeholder
    if (!petImage || petImage === "placeholder") {
      setImageLoaded(true);
      setImageError(false);
      return;
    }
    
    // Reset states at the start of loading
    setImageLoaded(false);
    setImageError(false);
    
    // Create a new image object to preload
    const img = new Image();
    
    // Set up event handlers before setting src
    img.onload = () => {
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true); // Still mark as "loaded" to remove loader
    };
    
    // Start loading the image
    img.src = petImage;
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [petImage]);

  // Fetch ETH to MYR exchange rate
  useEffect(() => {
    const fetchEthToMyrRate = async () => {
      try {
        const response = await fetch("/api/ethConversion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setEthToMyrRate(data.myrPrice)
        }
      } catch (error) {
        console.error("Error fetching ETH to MYR rate:", error)
      }
    }

    fetchEthToMyrRate()
  }, [])

  // Send a message to the chatbot
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // Add user message to chat
    const userMsgId = Date.now().toString()
    const userMsg: Message = {
      id: userMsgId,
      content: input,
      role: "user"
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)
    
    try {
      // Get chat history excluding system messages
      const history = messages.filter(msg => msg.role !== "system").map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      // Call API with user message and history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history
        })
      })
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log("Chatbot API response:", data)
      
      // Add assistant message to chat
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || "I'm not sure how to respond to that.",
        role: "assistant",
        donationIntent: data.donationIntent || false,
        charity: data.matchingCharity || null
      }
      
      setMessages(prev => [...prev, assistantMsg])
      
      // If donation intent detected, fetch milestones for display
      if (data.donationIntent && data.matchingCharity?.smart_contract_address) {
        await fetchCharityMilestones(data.matchingCharity.smart_contract_address)
      }
      
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again later.",
        role: "assistant"
      }
      
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  
// Fetch milestones for display only
const fetchCharityMilestones = async (contractAddress: string) => {
  if (!contractAddress) {
    console.error("No contract address provided for milestone fetching")
    return
  }
  
  try {
    console.log("Fetching milestones for contract:", contractAddress)
    
    // 1. First fetch milestone names from database
    let milestoneNames = [];
    try {
      // Extract charity ID from the smart contract address
      const { data: charityData, error: charityError } = await supabase
        .from("charity_2")
        .select("id, contract_abi")
        .eq("smart_contract_address", contractAddress)
        .single();
      
      if (charityData?.id) {
        // Fetch milestone data using the charity_id
        const { data: milestonesData, error: milestonesError } = await supabase
          .from("milestone")
          .select("*")
          .eq("charity_id", charityData.id);
          
        if (milestonesData && !milestonesError) {
          console.log("Milestone names from database:", milestonesData);
          milestoneNames = milestonesData;
          setContractAbi(charityData.contract_abi)
        } else {
          console.error("Error fetching milestone names:", milestonesError);
        }
      } else {
        console.log("Could not find charity ID for address:", contractAddress);
      }
    } catch (error) {
      console.error("Database query error:", error);
    }
    
    // 2. Then fetch milestone data from blockchain
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/139d352315cd4c96ab2c5ec31db8c776")
    const contract = new ethers.Contract(contractAddress, contractAbi, provider)
    
    try {
      const milestonesCount = await contract.getMilestonesCount()
      console.log("Milestones count:", Number(milestonesCount))
      const milestonesList = []

      // Default names as fallback
      const defaultNames = [
        "Initial Development",
        "Community Outreach",
        "Project Implementation",
        "Operational Expenses",
        "Impact Assessment",
        "Sustainability Phase",
        "Project Expansion"
      ]

      for (let i = 0; i < milestonesCount; i++) {
        try {
          const milestone = await contract.getMilestone(i)
          console.log(`Raw milestone ${i} data:`, milestone)
          
          // According to contract ABI:
          // milestone[0] = wallet address
          // milestone[1] = targetAmount (BigInt)
          // milestone[2] = currentAmount (BigInt) 
          // milestone[3] = completed (boolean)
          
          // Find a matching milestone name from the database
          console.log("Milestones:", milestone)
          const mData = {
            id: i,
            name: milestoneNames[i]?.milestone_name || defaultNames[i % defaultNames.length] || `Milestone ${i + 1}`,
            wallet: milestone[0],
            targetAmount: Number(ethers.formatEther(milestone[2])),
            currentAmount: Number(ethers.formatEther(milestone[3])),
            completed: milestone[4],
            progress: milestone[4] ? 100 : 
              Math.min(Math.round((Number(ethers.formatEther(milestone[3])) / 
                Number(ethers.formatEther(milestone[2]))) * 100), 100)
          }
          
          milestonesList.push(mData)
        } catch (error) {
          console.error(`Error processing milestone ${i}:`, error)
        }
      }

      console.log("Processed milestones:", milestonesList)
      setMilestones(milestonesList)

    } catch (error) {
      console.error("Error fetching milestone data:", error)
    }
  } catch (error) {
    console.error("Error initializing contract:", error)
  }
}

  // Handle donation process using the function from page.tsx
  const processDonation = async () => {
    if (!donationState) return
    
    setDonationState({
      ...donationState,
      processing: true,
      status: "processing"
    })
    
    try {
      if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install MetaMask.")
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const contract = new ethers.Contract(
        donationState.charity.smart_contract_address,
        contractAbi,
        signer
      )

      // Use the general donate function instead of donateToMilestone
      const tx = await contract.donate({
        value: ethers.parseEther(donationState.amount)
      })
      
      // Add system message about the transaction
      const systemMsg: Message = {
        id: Date.now().toString(),
        content: `Processing donation transaction...`,
        role: "system"
      }
      setMessages(prev => [...prev, systemMsg])
      
      // Wait for transaction to complete
      const receipt = await tx.wait()
      
      // Update user's donation amount in Supabase
      if (user) {
        try {
          // Fetch current amount
          const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("amount_eth_donated")
            .eq("id", user.id)
            .single();
          
          if (!fetchError && userData) {
            const currentAmount = userData.amount_eth_donated || 0;
            const newAmount = currentAmount + parseFloat(donationState.amount);
            
            // Update the total donation amount
            await supabase
              .from("users")
              .update({ amount_eth_donated: newAmount })
              .eq("id", user.id);
          }
        } catch (error) {
          console.error("Error updating user donation data:", error);
        }
      }
      
      // Transaction successful
      setDonationState({
        ...donationState,
        processing: false,
        status: "completed",
        txHash: receipt.hash
      })
      
      // Add success message
      const successMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your generous donation of ${donationState.amount} ETH to support ${donationState.charity.title}! Your transaction has been confirmed on the blockchain.`,
        role: "assistant"
      }
      setMessages(prev => [...prev, successMsg])
      
    } catch (error) {
      console.error("Error processing donation:", error)
      
      // Set error state
      setDonationState({
        ...donationState,
        processing: false,
        status: "error",
        error: error.message || "Transaction failed. Please try again."
      })
      
      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, but there was an error processing your donation: ${error.message || "Transaction failed"}`,
        role: "assistant"
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  // Reset donation state
  const resetDonation = () => {
    setDonationState(null)
    setMilestones([])
  }

  // Handle donation amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!donationState) return
    setDonationState({
      ...donationState,
      amount: e.target.value
    })
  }

  // Proceed to next step in donation flow
  const nextDonationStep = () => {
    if (!donationState) return
    
    if (donationState.status === "amount") {
      setDonationState({
        ...donationState,
        status: "confirming"
      })
    } else if (donationState.status === "confirming") {
      processDonation()
    }
  }

  // Go back a step in donation flow
  const prevDonationStep = () => {
    if (!donationState) return
    
    if (donationState.status === "confirming") {
      setDonationState({
        ...donationState,
        status: "amount"
      })
    }
  }

  // Render donation interface based on current state
  const renderDonationInterface = () => {
    if (!donationState) return null
    
    switch (donationState.status) {
      case "amount":
        return (
          <div className="space-y-4 rounded-lg border border-teal-100 bg-teal-50 p-4 my-4">
            <div className="space-y-2">
              <h3 className="font-medium text-teal-800">Donation amount</h3>
              <p className="text-sm text-teal-600">
                Enter the amount of ETH you'd like to donate
              </p>
            </div>
            
            {/* Show milestone information for display purposes only */}
            {milestones.length > 0 && (
  <div className="space-y-2 bg-white p-3 rounded-md border border-teal-100">
    <h4 className="text-sm font-medium text-teal-800">Project Milestones</h4>
    <div className="space-y-3 max-h-36 overflow-y-auto">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">{milestone.name}</span>
            {milestone.completed && (
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs py-0 px-2">
                <CheckCircle className="mr-1 h-2 w-2" />
                Completed
              </Badge>
            )}
          </div>
          <Progress
            value={milestone.progress}
            className="h-1.5"
            aria-label={`${milestone.progress}% funded`}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{milestone.progress}% funded</span>
            <span>
              {milestone.currentAmount.toFixed(4)} / {
                milestone.targetAmount > 100 
                  ? milestone.targetAmount.toFixed(0) 
                  : milestone.targetAmount.toFixed(4)
              } ETH
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            
            <div className="grid grid-cols-2 gap-2">
              {["0.01", "0.05", "0.1", "0.5"].map((amount) => (
                <Button
                  key={amount}
                  variant={donationState.amount === amount ? "default" : "outline"}
                  className={donationState.amount === amount ? "bg-teal-600" : ""}
                  onClick={() => setDonationState({...donationState, amount})}
                >
                  {amount} ETH
                </Button>
              ))}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Or enter custom amount:</label>
              <Input
                type="number"
                min="0.001"
                step="0.001"
                value={donationState.amount}
                onChange={handleAmountChange}
                className="bg-white"
              />
              {donationState.amount && (
                <div className="text-xs text-gray-500">
                  ≈ {(Number(donationState.amount) * ethToMyrRate).toLocaleString()} MYR
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetDonation}
              >
                Cancel
              </Button>
              <Button
                onClick={nextDonationStep}
                disabled={!donationState.amount || Number(donationState.amount) <= 0}
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )
        
      case "confirming":
        return (
          <div className="space-y-4 rounded-lg border border-teal-100 bg-teal-50 p-4 my-4">
            <div className="space-y-2">
              <h3 className="font-medium text-teal-800">Confirm your donation</h3>
              <p className="text-sm text-teal-600">
                Please review your donation details before confirming
              </p>
            </div>
            
            <div className="space-y-3 bg-white p-3 rounded-md border border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Project:</span>
                <span className="font-medium">{donationState.charity.title}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <div className="text-right">
                  <div className="font-medium">{donationState.amount} ETH</div>
                  <div className="text-xs text-gray-500">
                    ≈ {(Number(donationState.amount) * ethToMyrRate).toLocaleString()} MYR
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevDonationStep}
              >
                Back
              </Button>
              <Button
                onClick={nextDonationStep}
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                Confirm Donation
              </Button>
            </div>
          </div>
        )
        
      case "processing":
        return (
          <div className="space-y-4 rounded-lg border border-teal-100 bg-teal-50 p-4 my-4">
            <div className="flex flex-col items-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
              <h3 className="font-medium text-teal-800">Processing your donation</h3>
              <p className="text-sm text-teal-600 text-center">
                Please confirm the transaction in your wallet and wait for it to be processed.
              </p>
            </div>
          </div>
        )
        
      case "completed":
        return (
          <div className="space-y-4 rounded-lg border border-green-100 bg-green-50 p-4 my-4">
            <Alert className="bg-green-100 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle>Donation Successful!</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Your donation of {donationState.amount} ETH was successful.</p>
                <p className="text-sm text-green-700 mb-2">
                  ≈ {(Number(donationState.amount) * ethToMyrRate).toLocaleString()} MYR
                </p>
                {donationState.txHash && (
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${donationState.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-green-700 hover:text-green-800"
                  >
                    View transaction
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={resetDonation}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
          </div>
        )
        
      case "error":
        return (
          <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 my-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Donation Failed</AlertTitle>
              <AlertDescription>
                {donationState.error || "There was an error processing your donation. Please try again."}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetDonation}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setDonationState({...donationState, status: "confirming"})}
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer z-50"
        size="icon"
      >
        {/* Only show loader when actively loading (not for error states) */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
        
        {/* Main image with fallback handling */}
        {petImage !== "placeholder" ? (
          <img
            src={petImage}
            alt="Virtual Pet"
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded && !imageError ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
        
        {/* Error fallback that displays when load fails */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </Button>

      {/* Chat dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center sm:items-end sm:justify-end sm:p-6">
          <Card className="w-full max-w-xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <CardHeader className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg relative mr-3">
                    {petImage !== "placeholder" ? (
                      <img
                        src={petImage}
                        alt="Virtual Pet"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">BlockChair Assistant</CardTitle>
                    <CardDescription>How can I help you donate today?</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div className="max-w-xs">
                    <p className="mb-4">
                      Hi there! I'm your BlockChair donation assistant. How would you like to help today?
                    </p>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setInput("I want to donate to children's education")}
                      >
                        Donate to children's education
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setInput("Show me medical charity projects")}
                      >
                        Show me medical charities
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setInput("Tell me about BlockChair")}
                      >
                        Tell me about BlockChair
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role !== "system" && (
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <Markdown
                              options={{
                                overrides: {
                                  code: {
                                    component: ({ children, ...props }) => (
                                      <code className="bg-background/80 rounded px-1 py-0.5 font-mono text-sm" {...props}>
                                        {children}
                                      </code>
                                    ),
                                  },
                                  pre: {
                                    component: ({ children, ...props }) => (
                                      <pre
                                        className="bg-background text-foreground p-2 rounded-md my-2 overflow-x-auto font-mono text-sm"
                                        {...props}
                                      >
                                        {children}
                                      </pre>
                                    ),
                                  },
                                  ul: {
                                    component: ({ children, ...props }) => (
                                      <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
                                        {children}
                                      </ul>
                                    ),
                                  },
                                  ol: {
                                    component: ({ children, ...props }) => (
                                      <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
                                        {children}
                                      </ol>
                                    ),
                                  },
                                  a: {
                                    component: ({ children, ...props }) => (
                                      <a
                                        className="text-primary underline hover:text-primary/80"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        {...props}
                                      >
                                        {children}
                                      </a>
                                    ),
                                  },
                                  p: {
                                    component: ({ children, ...props }) => (
                                      <p className="my-1" {...props}>
                                        {children}
                                      </p>
                                    ),
                                  },
                                },
                              }}
                            >
                              {message.content}
                            </Markdown>
                          ) : (
                            <p>{message.content}</p>
                          )}
                          
                          {/* Show charity card if this message has a donation intent */}
                          {message.role === "assistant" && message.donationIntent && message.charity && !donationState && (
                            <div className="mt-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-3 border border-teal-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="font-medium text-teal-800">Suggested Project</span>
                              </div>
                              
                              {(message.charity.cover_image || message.charity.image) && (
                                <div className="relative rounded-lg overflow-hidden mb-3">
                                  <img 
                                    src={message.charity.cover_image || message.charity.image || "/placeholder.svg"}
                                    alt={message.charity.title}
                                    className="w-full h-32 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                    <div className="p-3 text-white">
                                      <h3 className="text-lg font-bold">{message.charity.title}</h3>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <h4 className="font-medium mb-1">{message.charity.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{message.charity.description}</p>
                              
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{message.charity.funding_percentage || 0}%</span>
                                  </div>
                                  <Progress
                                    value={message.charity.funding_percentage || 0}
                                    className="h-1.5"
                                  />
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {message.charity.target_amount || 0} ETH goal
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {message.charity.supporters || 0} supporters
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                className="w-full mt-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                                size="sm"
                                onClick={() => {
                                  fetchCharityMilestones(message.charity.smart_contract_address);
                                  setDonationState({
                                    charity: message.charity,
                                    amount: "0.01",
                                    processing: false,
                                    status: "amount"
                                  });
                                }}
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                Donate to this project
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Donation interface */}
                  {donationState && renderDonationInterface()}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%] flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
            
            <CardFooter className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading || (donationState && donationState.status !== "completed" && donationState.status !== "error")}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading || (donationState && donationState.status !== "completed" && donationState.status !== "error")}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}