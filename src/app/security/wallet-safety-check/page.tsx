"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Search, ExternalLink, Shield } from "lucide-react"

// Etherscan API for Sepolia testnet
const ETHERSCAN_API_BASE = "https://api-sepolia.etherscan.io/api"

export default function WalletChecker() {
  const [walletAddress, setWalletAddress] = useState("")
  const [transactions, setTransactions] = useState([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [credibilityScore, setCredibilityScore] = useState(null)
  const [analysisComments, setAnalysisComments] = useState([])
  const [analysisLoading, setAnalysisLoading] = useState(false)

  const fetchTransactions = async () => {
    if (!walletAddress) {
      setStatus("Please enter an Ethereum address")
      return
    }

    try {
      setLoading(true)
      setStatus("")
      setTransactions([])
      setCredibilityScore(null)
      setAnalysisComments([])
      setAnalysisLoading(false)

      // Fetch transactions from Etherscan API (Sepolia testnet)
      const apiUrl = `${ETHERSCAN_API_BASE}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=4VI4XSXYXP3MCHHP6ZCIX1HK1M4HHXJQZG`

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.status !== "1" || !data.result || data.result.length === 0) {
        setStatus("No recent transactions found or invalid address")
        setLoading(false)
        return
      }

      // Process transaction data
      const processedTransactions = data.result.map((tx) => {
        const isOutgoing = tx.from.toLowerCase() === walletAddress.toLowerCase()
        const amount = Number.parseInt(tx.value) / 1e18 // Convert wei to ETH

        return {
          signature: tx.hash, // Using hash as signature for compatibility
          date: new Date(Number.parseInt(tx.timeStamp) * 1000).toLocaleString(),
          amount: isOutgoing ? -amount : amount,
          from: tx.from,
          to: tx.to,
        }
      })

      setTransactions(processedTransactions)

      // Send transactions to backend for LLM analysis
      analyzeTransactionsWithLLM(processedTransactions)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setStatus("Failed to fetch transactions. Please verify the address and try again.")
      setLoading(false)
    }
  }

  const analyzeTransactionsWithLLM = async (transactions) => {
    if (!transactions.length) {
      setStatus("No transactions to analyze")
      return
    }

    try {
      setAnalysisLoading(true)

      const response = await fetch("/api/analyzeTransactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      })

      const data = await response.json()

      if (data.error) {
        setStatus("Failed to analyze transactions")
        setAnalysisLoading(false)
        return
      }

      setCredibilityScore(data.score)
      setAnalysisComments(data.comments)
      setAnalysisLoading(false)
    } catch (error) {
      console.error("LLM analysis error:", error)
      setStatus("Failed to analyze transactions")
      setAnalysisLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const truncateSignature = (signature) => {
    return `${signature.substring(0, 6)}...${signature.substring(signature.length - 4)}`
  }

  return (
    <div className="container mx-auto min-h-screen pt-24 pb-8 px-4 max-w-5xl">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg py-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 ">
            <Shield className="h-6 w-6" /> Ethereum Wallet Security Analyzer
          </CardTitle>
          <CardDescription className="text-slate-200">
            Verify wallet credibility and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <Input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Ethereum Wallet Address"
              className="flex-1"
            />
            <Button onClick={fetchTransactions} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Wallet
                </>
              )}
            </Button>
          </div>

          {status && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          {transactions.length > 0 && (
            <div className="mb-8 bg-slate-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-700" /> Security Analysis
              </h2>

              {analysisLoading ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                  <p className="text-slate-600">Analyzing wallet transactions...</p>
                </div>
              ) : credibilityScore !== null ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Credibility Score</span>
                      <span className={`font-bold ${getScoreColor(credibilityScore)}`}>{credibilityScore}/100</span>
                    </div>
                    <Progress
                      value={credibilityScore}
                      className="h-2"
                      indicatorClassName={
                        credibilityScore >= 80 ? "bg-green-600" : credibilityScore >= 60 ? "bg-amber-600" : "bg-red-600"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-700">Analysis Insights:</h3>
                    {Array.isArray(analysisComments) && analysisComments.length > 0 ? (
                      <ul className="space-y-2">
                        {analysisComments.map((comment, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                            <span>{comment}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-600">No analysis comments available.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-slate-600 py-2">Waiting for analysis to begin...</p>
              )}
            </div>
          )}

          {transactions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead>Date</TableHead>
                      <TableHead>Amount (ETH)</TableHead>
                      <TableHead className="hidden md:table-cell">Signature</TableHead>
                      <TableHead className="w-[100px]">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant={tx.amount > 0 ? "success" : "destructive"} className="font-mono">
                            {tx.amount > 0 ? "+" : ""}
                            {Math.abs(tx.amount).toFixed(6)} ETH
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-slate-500">
                          {truncateSignature(tx.signature)}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:inline">View</span>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-slate-500 pt-2 pb-4">
          <span>Powered by Ethereum Sepolia Testnet</span>
          <span>Data refreshed: {new Date().toLocaleString()}</span>
        </CardFooter>
      </Card>
    </div>
  )
}

