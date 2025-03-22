"use client"

import { useState } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Search, ExternalLink, Shield } from "lucide-react"

const SOLANA_RPC_URL = "https://api.devnet.solana.com" // Change if using mainnet

export default function WalletChecker() {
  const [walletAddress, setWalletAddress] = useState("")
  const [transactions, setTransactions] = useState([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [credibilityScore, setCredibilityScore] = useState(null)
  const [analysisComments, setAnalysisComments] = useState([])

  const fetchTransactions = async () => {
    if (!walletAddress) {
      setStatus("Please enter a Solana address")
      return
    }

    try {
      setLoading(true)
      setStatus("")
      setTransactions([])
      setCredibilityScore(null)
      setAnalysisComments([])

      const connection = new Connection(SOLANA_RPC_URL)
      const publicKey = new PublicKey(walletAddress)

      // Fetch latest 10 transactions
      const confirmedSignatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 })

      if (!confirmedSignatures || confirmedSignatures.length === 0) {
        setStatus("No recent transactions found")
        setLoading(false)
        return
      }

      // Fetch transaction details
      const transactionsDetails = await Promise.all(
        confirmedSignatures.map(async (tx) => {
          const txDetails = await connection.getTransaction(tx.signature, { commitment: "confirmed" })

          if (!txDetails || !txDetails.meta || !txDetails.transaction) return null

          const accountIndex = txDetails.transaction.message.accountKeys.findIndex(
            (key) => key.toBase58() === walletAddress,
          )

          if (accountIndex === -1) return null // Skip if wallet isn't involved

          const preBalance = txDetails.meta.preBalances[accountIndex]
          const postBalance = txDetails.meta.postBalances[accountIndex]
          const amountTransferred = (postBalance - preBalance) / 1e9 // Convert lamports to SOL

          return {
            signature: tx.signature,
            date: new Date(tx.blockTime * 1000).toLocaleString(),
            amount: amountTransferred,
          }
        }),
      )

      const filteredTransactions = transactionsDetails.filter(Boolean)
      setTransactions(filteredTransactions)

      // Send transactions to backend for LLM analysis
      analyzeTransactionsWithLLM(filteredTransactions)

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
      const response = await fetch("/api/analyzeTransactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      })

      const data = await response.json()

      if (data.error) {
        setStatus("Failed to analyze transactions")
        return
      }

      setCredibilityScore(data.score)
      setAnalysisComments(data.comments)
    } catch (error) {
      console.error("LLM analysis error:", error)
      setStatus("Failed to analyze transactions")
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
        <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-t-lg py-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 ">
            <Shield className="h-6 w-6" /> Solana Wallet Security Analyzer
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
              placeholder="Enter Solana Wallet Address"
              className="flex-1"
            />
            <Button onClick={fetchTransactions} disabled={loading} className="bg-slate-800 hover:bg-slate-700">
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

          {credibilityScore !== null && (
            <div className="mb-8 bg-slate-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-700" /> Security Analysis
              </h2>

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
                      <TableHead>Amount (SOL)</TableHead>
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
                            {tx.amount.toFixed(6)} SOL
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-slate-500">
                          {truncateSignature(tx.signature)}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://explorer.solana.com/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
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
          <span>Powered by Solana Blockchain</span>
          <span>Data refreshed: {new Date().toLocaleString()}</span>
        </CardFooter>
      </Card>
    </div>
  )
}

