"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import { ethers } from "ethers"
import { hexlify } from "ethers"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  ExternalLink,
  InfoIcon,
  LineChart,
  Loader2,
  X,
  Shield,
  DollarSign,
  Building2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Building,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import LatestUpdates from "../../../../components/latest-updates"

interface Donation {
  id: string
  title: string
  description: string
  cover_image: string
  total_amount: number
  target_amount: number
  organization_name: string
  websiteurl: string
  smart_contract_address: string
  contract_abi: object[]
  problem_statement?: string
  organization_info?: string
}

interface Milestone {
  id: string
  charity_id: string
  milestone_name: string
  target_amount: number
  company_name: string
  funds_raised: number
  status: "pending" | "completed"
}

interface Transaction {
  id?: string
  charity_id?: string
  amount?: number
  donor_name?: string
  timestamp?: string
  tx_hash?: string
  hash?: string
  from?: string
  to?: string
  value?: string
  donor?: string
}

const DonationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [donation, setDonation] = useState<Donation | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true) // New state for data loading
  const [onChainTransactions, setOnChainTransactions] = useState<Transaction[]>([])
  const [totalRaised, setTotalRaised] = useState<number>(0)
  const [targetAmount, setTargetAmount] = useState<number>(10) // Default to 10 ETH, will be updated from contract
  const [milestonesOnChain, setMilestonesOnChain] = useState<any[]>([])
  const [contract, setContract] = useState<any>(null)
  const [contractCreationDate, setContractCreationDate] = useState<string>("")
  const [ethToMyrRate, setEthToMyrRate] = useState<number>(0) // Default rate, will be updated
  const [myrValues, setMyrValues] = useState({
    totalRaised: 0,
    targetAmount: 0,
    remainingAmount: 0,
  })

  // New states for modal and donation process
  const [modalOpen, setModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionResult, setTransactionResult] = useState<{
    status: "success" | "error" | null
    message: string
    txHash?: string
  }>({ status: null, message: "" })

  // Add this state to store milestone transactions
  const [milestoneTransactions, setMilestoneTransactions] = useState([])

  // Sample problem statement and organization info
  const defaultProblemStatement = `Digital exclusion is a barrier preventing individuals from accessing opportunities and seeking financial support. Research shows people from the lowest socio-economic groups are unable to apply for public aid as they lack access to the internet, cell phones and computers, nor have the knowledge of how to use the devices. During the Covid-19 pandemic, more than 20% of people were unable to seek support due to digital exclusion.

Most vulnerable homeless people are disadvantaged by this even further, as there is an absence of public digital centers in developing countries. This leads to limited access to computers and with it the opportunities and aid it brings, as well as contributing to losing connection with family and friends.`

  const defaultOrganizationInfo = `Our organization, founded in 2018, seeks to educate homeless and socially vulnerable people in urban areas. Among various forms of support, we provide professional training for people in vulnerable conditions, with an emphasis on personal development and generating a source of income.`

  useEffect(() => {
    if (donation?.contract_abi && donation?.smart_contract_address) {
      try {
        const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/b7624d9f81c5486c88a86ca6f4b3ed44")
        const contract = new ethers.Contract(donation.smart_contract_address, donation.contract_abi, provider)
        setContract(contract)
      } catch (error) {
        console.error("Error initializing contract:", error)
      }
    }
  }, [donation?.contract_abi, donation?.smart_contract_address])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setDataLoading(true) // Set data loading to true when fetching starts

      try {
        // Check if Supabase is properly initialized
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are missing. Using sample data.")

          // Use sample data when Supabase credentials are missing
          setDonation({
            id: id as string,
            title: "Digital Inclusion Initiative",
            description: "Providing digital access and education to vulnerable communities",
            cover_image: "/placeholder.svg?height=400&width=800",
            total_amount: 0,
            target_amount: 10,
            organization_name: "Sample Organization",
            websiteurl: "https://example.org",
            smart_contract_address: "0x0000000000000000000000000000000000000000",
            contract_abi: [],
            problem_statement: defaultProblemStatement,
            organization_info: defaultOrganizationInfo,
          })
          const { data: milestonesData, error: milestonesError } = await supabase
            .from("milestone")
            .select("*")
            .eq("charity_2_id", id)

          setLoading(false)
          // Simulate data loading delay
          setTimeout(() => {
            setDataLoading(false)
          }, 3000)
          return
        }

        const { data: donationData, error: donationError } = await supabase
          .from("charity_2")
          .select("*")
          .eq("id", id)
          .single()

        const { data: milestonesData, error: milestonesError } = await supabase
          .from("milestone")
          .select("*")
          .eq("charity_id", id)

        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transaction_history")
          .select("*")
          .eq("charity_id", id)

        if (donationError) console.error("Donation fetch error:", donationError)
        if (milestonesError) console.error("Milestone fetch error:", milestonesError)
        if (transactionsError) console.error("Transaction fetch error:", transactionsError)

        // Use sample data if in development and no data is returned
        if (!donationData && process.env.NODE_ENV === "development") {
          // Sample donation data for development
          setDonation({
            id: id as string,
            title: "Digital Inclusion Initiative",
            description: "Providing digital access and education to vulnerable communities",
            cover_image: "/placeholder.svg?height=400&width=800",
            total_amount: 0,
            target_amount: 10,
            organization_name: "Sample Organization",
            websiteurl: "https://example.org",
            smart_contract_address: "0x0000000000000000000000000000000000000000",
            contract_abi: [],
            problem_statement: defaultProblemStatement,
            organization_info: defaultOrganizationInfo,
          })
        } else {
          // Add default problem statement and organization info if not present
          const enhancedDonationData = {
            ...donationData,
            problem_statement: donationData.problem_statement || defaultProblemStatement,
            organization_info: donationData.organization_info || defaultOrganizationInfo,
          }
          setDonation(enhancedDonationData as Donation)
        }

        setMilestones(milestonesData || [])
        setTransactions(transactionsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)

        // Fallback to sample data on error
        setDonation({
          id: id as string,
          title: "Digital Inclusion Initiative",
          description: "Providing digital access and education to vulnerable communities",
          cover_image: "/placeholder.svg?height=400&width=800",
          total_amount: 0,
          target_amount: 10,
          organization_name: "Sample Organization",
          websiteurl: "https://example.org",
          smart_contract_address: "0x0000000000000000000000000000000000000000",
          contract_abi: [],
          problem_statement: defaultProblemStatement,
          organization_info: defaultOrganizationInfo,
        })
      } finally {
        setLoading(false)
        // Keep dataLoading true until contract data is fetched
      }
    }

    fetchData()
  }, [id])

  const fetchDonationEvents = async () => {
    if (!contract) return

    try {
      const txs = await contract.queryFilter("DonationReceived", 0, "latest")
      const formattedTxs = txs.map((tx) => ({
        hash: tx.transactionHash,
        donor: tx.args.donor,
        amount: ethers.formatEther(tx.args.amount),
        timestamp: new Date(tx.args.timestamp * 1000).toLocaleString(),
      }))

      setTransactions(formattedTxs.reverse())
    } catch (error) {
      console.error("Error fetching donation events:", error)
    }
  }

  const convertEthToMyr = async (ethAmount) => {
    try {
      // In a real application, you would fetch the current rate from an API
      // For now, we'll use a fixed rate for demonstration
      return ethAmount * ethToMyrRate
    } catch (error) {
      console.error("Error converting ETH to MYR:", error)
      return ethAmount * ethToMyrRate // Fallback to using the default rate
    }
  }

  // Update MYR values whenever ETH amounts change
  useEffect(() => {
    const updateMyrValues = async () => {
      const totalRaisedMyr = await convertEthToMyr(totalRaised)
      const targetAmountMyr = await convertEthToMyr(targetAmount)
      const remainingAmountMyr = await convertEthToMyr(Math.max(targetAmount - totalRaised, 0))

      setMyrValues({
        totalRaised: totalRaisedMyr,
        targetAmount: targetAmountMyr,
        remainingAmount: remainingAmountMyr,
      })
    }

    updateMyrValues()
  }, [totalRaised, targetAmount, ethToMyrRate])

  // Fetch current ETH to MYR rate
  useEffect(() => {
    const fetchEthToMyrRate = async () => {
      console.log("Trying to fetch price of ETH to MYR")

      try {
        // Assuming your backend is running on localhost:3001 or another address
        const response = await fetch("/api/ethConversion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://your-frontend-url.com", // Adjust to your actual frontend URL
            "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
            "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
          },
        })

        if (response.ok) {
          const data = await response.json()
          setEthToMyrRate(data.myrPrice) // Set the MYR price in state
          console.log("SET NEW ETHEREUM PRICE TO:", data.myrPrice)
        } else {
          setEthToMyrRate(8000);
          console.error("Failed to fetch ETH to MYR rate. Status:", response.status)
        }
      } catch (error) {
        console.error("Error fetching ETH to MYR rate:", error)
      }
    }

    fetchEthToMyrRate()

    // Set up an interval to refresh the rate periodically
    const intervalId = setInterval(fetchEthToMyrRate, 10000) // Every 10 seconds (you can adjust this as needed)

    return () => clearInterval(intervalId) // Cleanup the interval on component unmount
  }, [])

  useEffect(() => {
    if (contract) {
      fetchDonationEvents()
    }
  }, [contract])

  const fetchOnChainTransactions = async (contractAddress: string) => {
    if (!contractAddress) {
      console.error("No smart contract address available!")
      return
    }

    try {
      const response = await fetch(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=desc&apikey=4VI4XSXYXP3MCHHP6ZCIX1HK1M4HHXJQZG`,
      )

      const data = await response.json()

      if (!data.result || data.result.length === 0) {
        console.warn("No transactions found for contract.")
        return
      }

      const formattedTxs = data.result.slice(0, 10).map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        timestamp: new Date(tx.timeStamp * 1000).toLocaleString(),
      }))

      setOnChainTransactions(formattedTxs)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    }
  }

  const fetchContractCreationDate = async (contractAddress: string) => {
    if (!contractAddress) return

    try {
      // Get the first transaction to the contract address from Etherscan API
      const response = await fetch(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=4VI4XSXYXP3MCHHP6ZCIX1HK1M4HHXJQZG`,
      )

      const data = await response.json()

      if (data.result && data.result.length > 0) {
        // The first transaction timestamp is likely the contract creation
        const timestamp = Number.parseInt(data.result[0].timeStamp) * 1000
        const date = new Date(timestamp)
        setContractCreationDate(
          date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        )
      }
    } catch (error) {
      console.error("Failed to fetch contract creation date:", error)
    }
  }

  useEffect(() => {
    if (donation?.smart_contract_address) {
      fetchOnChainTransactions(donation.smart_contract_address)
      fetchContractCreationDate(donation.smart_contract_address)
    }
  }, [donation])

  // Add this function to fetch milestone transactions with their hashes
  const fetchMilestoneTransactions = async () => {
    if (!contract) return []

    try {
      const milestonesCount = await contract.getMilestonesCount()
      console.log("Milestones count:", milestonesCount.toString())
      const transactions = []

      for (let i = 0; i < milestonesCount; i++) {
        const milestone = await contract.getMilestone(i)
        console.log(`Milestone ${i}:`, milestone) // Log each milestone
        const completed = milestone[4] // completed at index 3
        const txHash = milestone[5] // txHash at index 4
        const wallet = milestone[1] // wallet address at index 0
        const targetAmount = milestone[2]

        // Ensure the transaction hash is valid (not empty)
        if (completed && txHash && txHash !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          console.log("transactions are PUSHEDDDD")
          transactions.push({
            index: i,
            targetAmount: targetAmount,
            name: milestonesName[i]?.milestone_name || `Milestone ${i + 1}`, // Fetch from useState variable
            company_name: milestonesName[i]?.company_name,
            txHash: hexlify(txHash),
            wallet: wallet, // Extract wallet address
          })
        }
      }

      // Pass the data to LatestUpdate component
      return transactions
    } catch (error) {
      console.error("Error fetching milestone transactions:", error)
      return []
    }
  }

  useEffect(() => {
    console.log("Contract: ", contract)
    if (!contract) return // Wait until contract is initialized

    console.log("Fetching transactions...")
    const loadTransactions = async () => {
      const transactions = await fetchMilestoneTransactions()
      setMilestoneTransactions(transactions)
      console.log("Transactions to be checked:", transactions)
    }

    loadTransactions()
  }, [contract]) // Run when contract is updated

  // Update the fetchContractData function to correctly get the total donations and target amount
  const fetchContractData = async () => {
    if (!donation?.smart_contract_address) return

    try {
      const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/b7624d9f81c5486c88a86ca6f4b3ed44")
      const contract = new ethers.Contract(donation.smart_contract_address, donation.contract_abi, provider)

      let targetAmountEth = 0
      let totalRaisedEth = 0

      // 1️⃣ Fetch total target amount using the stored state variable
      try {
        const targetAmountWei = await contract.totalTargetAmount()
        targetAmountEth = Number(ethers.formatEther(targetAmountWei))
        console.log("Target amount from contract totalTargetAmount:", targetAmountEth, "ETH")
      } catch (error) {
        console.error("Error fetching totalTargetAmount, falling back to getTotalRequired:", error)

        // Fallback to getTotalRequired if totalTargetAmount fails
        try {
          const fallbackTargetWei = await contract.getTotalRequired()
          targetAmountEth = Number(ethers.formatEther(fallbackTargetWei))
          console.log("Target amount from getTotalRequired fallback:", targetAmountEth, "ETH")
        } catch (fallbackError) {
          console.error("Error fetching getTotalRequired:", fallbackError)
        }
      }

      // 2️⃣ Fetch total lifetime donations using the new method
      try {
        const totalLifetimeWei = await contract.getTotalLifetimeDonations()
        totalRaisedEth = Number(ethers.formatEther(totalLifetimeWei))
        console.log("Total raised from getTotalLifetimeDonations:", totalRaisedEth, "ETH")
      } catch (error) {
        console.error("Error fetching getTotalLifetimeDonations, falling back to other methods:", error)

        // 3️⃣ Fallback: Try getTotalDonated for current unspent donations
        try {
          const currentDonationsWei = await contract.getTotalDonated()
          const currentDonations = Number(ethers.formatEther(currentDonationsWei))
          console.log("Current unspent donations from getTotalDonated:", currentDonations, "ETH")

          // 4️⃣ Calculate completed milestones to add to current donations
          try {
            const milestonesCount = await contract.getMilestonesCount()
            let completedMilestonesTotal = 0

            for (let i = 0; i < milestonesCount; i++) {
              const milestone = await contract.getMilestone(i)
              const targetAmount = Number(ethers.formatEther(milestone[2])) // targetAmount at index 2
              const completed = milestone[4] // completed at index 4

              if (completed) {
                completedMilestonesTotal += targetAmount
              }
            }

            console.log("Completed milestones total:", completedMilestonesTotal, "ETH")
            totalRaisedEth = currentDonations + completedMilestonesTotal
            console.log("Total calculated (current + completed):", totalRaisedEth, "ETH")
          } catch (milestonesError) {
            console.error("Error calculating from milestones:", milestonesError)
            totalRaisedEth = currentDonations // Use just current donations if milestone calculation fails
          }
        } catch (donatedError) {
          console.error("Error fetching getTotalDonated:", donatedError)

          // 5️⃣ Last fallback: Calculate from transaction history
          if (onChainTransactions.length > 0) {
            try {
              const txTotal = onChainTransactions.reduce((sum, tx) => sum + Number(tx.value || 0), 0)
              console.log("Total calculated from transactions:", txTotal, "ETH")
              if (txTotal > 0) {
                totalRaisedEth = txTotal
              }
            } catch (txError) {
              console.error("Error calculating from transactions:", txError)
            }
          }
        }
      }

      // 6️⃣ Fetch milestones for display (not for calculation)
      try {
        const milestonesCount = await contract.getMilestonesCount()
        const milestones = []

        for (let i = 0; i < milestonesCount; i++) {
          const milestone = await contract.getMilestone(i)
          milestones.push({
            wallet: milestone[1], // wallet at index 1
            targetAmount: Number(ethers.formatEther(milestone[2])), // targetAmount at index 2
            currentAmount: Number(ethers.formatEther(milestone[3])), // currentAmount at index 3
            completed: milestone[4], // completed at index 4
          })
        }

        setMilestonesOnChain(milestones)
      } catch (error) {
        console.error("Error fetching milestones for display:", error)
      }

      // 7️⃣ Set final state values
      setTargetAmount(targetAmountEth)
      setTotalRaised(totalRaisedEth)

      // Set data loading to false after all data is fetched
      setDataLoading(false)
    } catch (error) {
      console.error("Error fetching contract data:", error)
      setDataLoading(false) // Make sure to set loading to false even on error
    }
  }

  useEffect(() => {
    if (donation?.smart_contract_address) {
      fetchContractData()
    }
  }, [donation])

  // Add a useEffect to refresh contract data periodically
  useEffect(() => {
    if (donation?.smart_contract_address) {
      fetchContractData()

      // Set up an interval to refresh the contract data every 30 seconds
      const intervalId = setInterval(() => {
        fetchContractData()
      }, 30000)

      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId)
    }
  }, [donation?.smart_contract_address])

  // Update the handleDonation function to refresh contract data after successful donation
  const handleDonation = async () => {
    if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
      setTransactionResult({
        status: "error",
        message: "Please enter a valid donation amount.",
      })
      return
    }

    setIsProcessing(true)
    setTransactionResult({ status: null, message: "" })

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(donation.smart_contract_address, donation.contract_abi, signer)

      const tx = await contract.donate({
        value: ethers.parseUnits(donationAmount, "ether"),
      })

      await tx.wait()

      // Refresh contract data first to get the updated total
      await fetchContractData()
      // Then refresh transaction history
      await fetchOnChainTransactions(donation.smart_contract_address)

      setTransactionResult({
        status: "success",
        message: "Donation successful! Thank you for your contribution.",
        txHash: tx.hash,
      })
    } catch (error) {
      console.error("Transaction failed:", error)
      setTransactionResult({
        status: "error",
        message: `Transaction failed: ${error.reason || "Unknown error"}`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetModal = () => {
    setDonationAmount("")
    setTransactionResult({ status: null, message: "" })
  }

  const openDonationModal = () => {
    resetModal()
    setModalOpen(true)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mr-2" />
        <p className="text-lg font-medium">Loading campaign details...</p>
      </div>
    )

  if (!donation)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertTriangle className="h-8 w-8 text-amber-500 mr-2" />
        <p className="text-lg font-medium">Donation campaign not found.</p>
      </div>
    )

  // Use onChainTransactions instead of transactions for display
  const displayTransactions = onChainTransactions.length > 0 ? onChainTransactions : []

  // Calculate progress using the contract values
  const currentAmount = totalRaised
  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
  const remainingAmount = Math.max(targetAmount - currentAmount, 0)

  const milestonesName = milestones

  return (
    <div className="min-h-screen pt-24 pb-8 px-6 bg-zinc-50 dark:bg-zinc-950">
      {donation.organization_name && (
        <div className="container mx-auto px-6 pt-5">
          <div className="flex items-center flex-wrap gap-3 mb-4 p-4 rounded-lg border border-emerald-400 dark:border-teal-700 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-full mr-3">
                <Building className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-xs text-emerald-100 mb-0.5 font-medium">Organization</div>
                <span className="font-semibold text-white">{donation.organization_name}</span>
              </div>
            </div>

            {donation.websiteurl && (
              <Link
                href={donation.websiteurl}
                target="_blank"
                className="flex items-center ml-auto px-3 py-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-black text-sm transition-colors duration-200"
              >
                <Globe className="h-4 w-4 mr-2 text-emerald-300" />
                <span>{donation.websiteurl.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="h-3 w-3 ml-1.5 text-emerald-300" />
              </Link>
            )}
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            <div className="mb-2"></div>

            {/* Enhanced Campaign Image Card */}

            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={donation.cover_image || "/placeholder.svg?height=400&width=800"}
                  alt={donation.title}
                  className="h-[300px] w-full object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-t-xl">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-green-600 rounded-full px-3 py-1 text-xs font-medium">Active Campaign</Badge>
                      <Badge
                        variant="outline"
                        className="bg-black/30 text-white border-white/20 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        Goal:{" "}
                        {dataLoading ? (
                          <Skeleton className="h-4 w-16 inline-block" />
                        ) : (
                          `${targetAmount.toFixed(2)} ETH`
                        )}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{donation.title}</h1>
                    <p className="text-zinc-200 text-sm max-w-3xl">{donation.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">Raised so far</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {dataLoading ? <Skeleton className="h-4 w-16" /> : `${progressPercentage}% of goal`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-medium text-green-700 dark:text-green-400">
                      {dataLoading ? <Skeleton className="h-6 w-24 ml-auto" /> : `${totalRaised.toFixed(4)} ETH`}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {dataLoading ? (
                        <Skeleton className="h-3 w-20 ml-auto" />
                      ) : (
                        `≈ ${myrValues.totalRaised.toLocaleString()} MYR`
                      )}
                    </div>
                  </div>
                </div>
                {dataLoading ? (
                  <Skeleton className="h-2 w-full mt-2" />
                ) : (
                  <Progress
                    value={progressPercentage}
                    className="h-2 mt-2 bg-zinc-100 dark:bg-zinc-800"
                    indicatorClassName="bg-green-600"
                  />
                )}
              </div>
            </CardContent>

            {/* What's the Problem Section */}
            <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  What's the problem?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{donation.problem_statement}</p>

                  <h3 className="text-xl font-medium mt-6 mb-2 text-green-700 dark:text-green-400">
                    About Our Organization
                  </h3>
                  <p className="text-zinc-700 dark:text-zinc-300">{donation.organization_info}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium">Transaction History</CardTitle>
                <CardDescription>Recent donations to this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="m-0">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction</TableHead>
                            <TableHead>Donor</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dataLoading ? (
                            // Skeleton loading for transactions
                            Array(5)
                              .fill(0)
                              .map((_, index) => (
                                <TableRow key={`skeleton-tx-${index}`}>
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-4 w-32" />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Skeleton className="h-4 w-28 ml-auto" />
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : displayTransactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-zinc-500">
                                No donations yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            displayTransactions.map((tx, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {tx.hash && (
                                    <Link
                                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                      target="_blank"
                                      className="flex items-center text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                                    >
                                      <span className="font-mono text-sm">
                                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                                      </span>
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {tx.from && (
                                    <span className="font-mono text-sm">
                                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {tx.value && (
                                    <div>
                                      <div>{tx.value} ETH</div>
                                      <div className="text-xs text-zinc-500">
                                        ≈ {(Number(tx.value) * ethToMyrRate).toLocaleString()} MYR
                                      </div>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-zinc-500 dark:text-zinc-400">
                                  {tx.timestamp}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  <TabsContent value="recent" className="m-0">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction</TableHead>
                            <TableHead>Donor</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dataLoading ? (
                            // Skeleton loading for recent transactions
                            Array(3)
                              .fill(0)
                              .map((_, index) => (
                                <TableRow key={`skeleton-recent-${index}`}>
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-4 w-32" />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Skeleton className="h-4 w-28 ml-auto" />
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : displayTransactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-zinc-500">
                                No donations yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            displayTransactions.slice(0, 5).map((tx, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {tx.hash && (
                                    <Link
                                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                      target="_blank"
                                      className="flex items-center text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                                    >
                                      <span className="font-mono text-sm">
                                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                                      </span>
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {tx.from && (
                                    <span className="font-mono text-sm">
                                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {tx.value && (
                                    <div>
                                      <div>{tx.value} ETH</div>
                                      <div className="text-xs text-zinc-500">
                                        ≈ {(Number(tx.value) * ethToMyrRate).toLocaleString()} MYR
                                      </div>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-zinc-500 dark:text-zinc-400">
                                  {tx.timestamp}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Add the Milestone Progress Card here */}
            <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium">Milestone Progress</CardTitle>
                <CardDescription>Transparent breakdown of funding goals and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <div className="text-right">
                        {dataLoading ? (
                          <Skeleton className="h-5 w-32 ml-auto" />
                        ) : (
                          <div className="font-medium">
                            {totalRaised.toFixed(4)} of {targetAmount.toFixed(4)} ETH
                          </div>
                        )}
                        {dataLoading ? (
                          <Skeleton className="h-3 w-40 ml-auto" />
                        ) : (
                          <div className="text-xs text-zinc-500">
                            ≈ {myrValues.totalRaised.toLocaleString()} of {myrValues.targetAmount.toLocaleString()} MYR
                          </div>
                        )}
                      </div>
                    </div>
                    {dataLoading ? (
                      <Skeleton className="h-2 w-full" />
                    ) : (
                      <Progress
                        value={progressPercentage}
                        className="h-2 bg-zinc-100 dark:bg-zinc-800"
                        indicatorClassName="bg-green-600"
                      />
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {dataLoading ? (
                        <>
                          <Skeleton className="h-4 w-24" />
                          <div className="text-right">
                            <Skeleton className="h-4 w-28 ml-auto" />
                            <Skeleton className="h-3 w-36 ml-auto mt-1" />
                          </div>
                        </>
                      ) : (
                        <>
                          <span>{progressPercentage}% Complete</span>
                          <div className="text-right">
                            <div>{remainingAmount.toFixed(4)} ETH remaining</div>
                            <div className="text-xs">≈ {myrValues.remainingAmount.toLocaleString()} MYR</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Funding Milestones</div>

                    {dataLoading ? (
                      // Skeleton loading for milestones
                      Array(3)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={`skeleton-milestone-${index}`}
                            className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-24" />
                              <div>
                                <Skeleton className="h-4 w-32 ml-auto" />
                                <Skeleton className="h-3 w-40 ml-auto mt-1" />
                              </div>
                            </div>
                          </div>
                        ))
                    ) : milestonesOnChain.length === 0 ? (
                      <div className="text-center py-6 text-zinc-500">No milestones found for this campaign</div>
                    ) : (
                      milestonesOnChain.map((milestone, index) => {
                        // Calculate progress percentage - handle the case where status is completed
                        const progressPercentage = milestone.completed
                          ? 100
                          : Math.min(Math.round((milestone.currentAmount / milestone.targetAmount) * 100), 100)

                        return (
                          <div
                            key={index}
                            className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Milestone {index + 1}: {milestonesName[index]?.milestone_name}
                                </span>
                                {milestone.completed && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Check className="mr-1 h-3 w-3" /> Achieved
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <Progress
                              value={progressPercentage}
                              className="h-2 bg-zinc-100 dark:bg-zinc-800"
                              indicatorClassName="bg-green-600"
                            />

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{progressPercentage}% Complete</span>
                              <div>
                                <div className="font-medium">
                                  {milestone.completed ? milestone.targetAmount.toFixed(4) : milestone.currentAmount.toFixed(4)} / {milestone.targetAmount.toFixed(4)} ETH
                                </div>
                                <div className="text-xs text-zinc-500">
                                  ≈ {(
                                    (milestone.completed ? milestone.targetAmount : milestone.currentAmount)
                                    * ethToMyrRate
                                  ).toLocaleString()} /{" "}
                                  {(milestone.targetAmount * ethToMyrRate).toLocaleString()} MYR
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Add the LatestUpdates component after the Milestone Progress Card */}
            <LatestUpdates
              contractAddress={donation.smart_contract_address}
              milestoneTransactions={milestoneTransactions}
              campaignTitle={donation.title}
              isLoading={dataLoading}
            />
          </div>

          <div className="space-y-6">
            <Card className="sticky top-20 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-xl font-medium">Contribute</CardTitle>
                <CardDescription>Support this campaign with ETH</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campaign Target</span>
                    <div className="text-right">
                      {dataLoading ? (
                        <>
                          <Skeleton className="h-4 w-24 ml-auto" />
                          <Skeleton className="h-3 w-32 ml-auto mt-1" />
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-sm font-medium">{targetAmount.toFixed(4)} ETH</span>
                          <div className="text-xs text-zinc-500">≈ {myrValues.targetAmount.toLocaleString()} MYR</div>
                        </>
                      )}
                    </div>
                  </div>
                  {dataLoading ? (
                    <Skeleton className="h-2 w-full" />
                  ) : (
                    <Progress
                      value={progressPercentage}
                      className="h-2 bg-zinc-100 dark:bg-zinc-800"
                      indicatorClassName="bg-green-600"
                    />
                  )}
                  <div className="flex items-center justify-between text-sm">
                    {dataLoading ? (
                      <>
                        <Skeleton className="h-4 w-24" />
                        <div className="text-right">
                          <Skeleton className="h-4 w-32 ml-auto" />
                          <Skeleton className="h-3 w-40 ml-auto mt-1" />
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-zinc-500 dark:text-zinc-400">{progressPercentage}% Complete</span>
                        <div className="text-right">
                          <span className="font-mono text-zinc-500 dark:text-zinc-400">
                            {currentAmount.toFixed(4)} / {targetAmount.toFixed(4)} ETH
                          </span>
                          <div className="text-xs text-zinc-500">
                            ≈ {myrValues.totalRaised.toLocaleString()} / {myrValues.targetAmount.toLocaleString()} MYR
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Campaign Stats section updated */}
                <div className="flex items-center justify-between rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-zinc-500" />
                    <div className="text-sm">
                      <div className="font-medium">Campaign Stats</div>
                      <div className="text-zinc-500 dark:text-zinc-400">
                        {dataLoading ? <Skeleton className="h-3 w-24" /> : `${displayTransactions.length} donations`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {dataLoading ? (
                      <>
                        <Skeleton className="h-5 w-24 ml-auto" />
                        <Skeleton className="h-3 w-32 ml-auto mt-1" />
                      </>
                    ) : (
                      <>
                        <div className="font-mono text-lg font-medium">{totalRaised.toFixed(4)} ETH</div>
                        <div className="text-xs text-zinc-500">≈ {myrValues.totalRaised.toLocaleString()} MYR</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Currency conversion info */}
                <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium text-green-700 dark:text-green-400">Currency Conversion</div>
                      <div className="text-green-600 dark:text-green-300">
                        {dataLoading ? (
                          <Skeleton className="h-4 w-32" />
                        ) : (
                          `1 ETH ≈ ${ethToMyrRate.toLocaleString()} MYR`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={openDonationModal}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Donate Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            {/* Contract Information Card */}
            <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium">Contract Information</CardTitle>
                <CardDescription>Verify this campaign's smart contract</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contract Address</span>
                    <span className="font-mono text-xs truncate max-w-[180px]" title={donation.smart_contract_address}>
                      {donation.smart_contract_address.slice(0, 6)}...{donation.smart_contract_address.slice(-4)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Creation Date</span>
                    {dataLoading ? (
                      <Skeleton className="h-4 w-28 ml-auto" />
                    ) : (
                      <span className="text-xs">{contractCreationDate || "Loading..."}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network</span>
                    <span className="text-xs">Sepolia Testnet</span>
                  </div>
                </div>

                <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5 text-zinc-500" />
                    <div className="text-sm">
                      <div className="font-medium">Verified Contract</div>
                      <div className="text-zinc-500 dark:text-zinc-400">View source code and details</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-2 pt-0 text-xs text-zinc-500 flex items-center justify-between">
                <span>Powered by Solidity</span>
                <span>Smart Contract Technology</span>
              </div>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(`https://sepolia.etherscan.io/address/${donation.smart_contract_address}`, "_blank")
                  }
                >
                  View on Etherscan
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      {/* Security and Verification Section */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Wallet Security Check */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-yellow-100">
          <div className="flex items-start">
            <div className="bg-yellow-50 p-3 rounded-full mr-4">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Wallet Security Check</h3>
              <p className="text-gray-600 mb-4">
                Don't know if the wallet is safe? Check their transaction and safety using our AI wallet security
                analyzer.
              </p>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
                <Link href="/security/wallet-safety-check">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Analyze Wallet Security
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Company Verification */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-teal-100">
          <div className="flex items-start">
            <div className="bg-teal-50 p-3 rounded-full mr-4">
              <Building2 className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Organization Verification</h3>
              <p className="text-gray-600 mb-4">
                Don't know if the company is verified? Run a comprehensive background check on the organization.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                <Link href="/security/verify-organizations">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Organization
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Donation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
            <DialogDescription>Support {donation.title} by donating ETH.</DialogDescription>
          </DialogHeader>

          {!isProcessing && transactionResult.status === null && (
            <>
              <div className="space-y-4 py-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Target Amount</span>
                    <div className="text-right">
                      {dataLoading ? (
                        <>
                          <Skeleton className="h-4 w-20 ml-auto" />
                          <Skeleton className="h-3 w-24 ml-auto mt-1" />
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-sm">{targetAmount.toFixed(2)} ETH</span>
                          <div className="text-xs text-zinc-500">≈ {myrValues.targetAmount.toLocaleString()} MYR</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Amount</span>
                    <div className="text-right">
                      {dataLoading ? (
                        <>
                          <Skeleton className="h-4 w-20 ml-auto" />
                          <Skeleton className="h-3 w-24 ml-auto mt-1" />
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-sm">{totalRaised.toFixed(4)} ETH</span>
                          <div className="text-xs text-zinc-500">≈ {myrValues.totalRaised.toLocaleString()} MYR</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Needed</span>
                    <div className="text-right">
                      {dataLoading ? (
                        <>
                          <Skeleton className="h-4 w-20 ml-auto" />
                          <Skeleton className="h-3 w-24 ml-auto mt-1" />
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-sm font-bold">{remainingAmount.toFixed(4)} ETH</span>
                          <div className="text-xs text-zinc-500">
                            ≈ {myrValues.remainingAmount.toLocaleString()} MYR
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Donation Amount (ETH)
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="font-mono"
                  />
                  {donationAmount && (
                    <div className="text-sm text-zinc-500">
                      ≈ {(Number(donationAmount) * ethToMyrRate).toLocaleString()} MYR
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDonation}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Donate
                </Button>
              </DialogFooter>
            </>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-4" />
              <p className="text-center font-medium">Processing your donation...</p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Please confirm the transaction in your wallet and wait for it to be processed.
              </p>
            </div>
          )}

          {!isProcessing && transactionResult.status === "success" && (
            <div className="py-6">
              <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle>Donation Successful!</AlertTitle>
                <AlertDescription>
                  <p>Thank you for your contribution of {donationAmount} ETH.</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    ≈ {(Number(donationAmount) * ethToMyrRate).toLocaleString()} MYR
                  </p>
                  {transactionResult.txHash && (
                    <div className="mt-2">
                      <Link
                        href={`https://sepolia.etherscan.io/tx/${transactionResult.txHash}`}
                        target="_blank"
                        className="flex items-center text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
                      >
                        View transaction
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {!isProcessing && transactionResult.status === "error" && (
            <div className="py-6">
              <Alert className="bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800">
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle>Transaction Failed</AlertTitle>
                <AlertDescription>{transactionResult.message}</AlertDescription>
              </Alert>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransactionResult({ status: null, message: "" })}
                >
                  Try Again
                </Button>
                <Button type="button" onClick={() => setModalOpen(false)} variant="destructive">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DonationDetails
