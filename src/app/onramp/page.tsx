"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, AlertCircle, CreditCard, Wallet } from "lucide-react";

export default function OnRampPage() {
  const [amount, setAmount] = useState<string>("100");
  const [paymentMethod, setPaymentMethod] = useState<string>("tng");
  const [step, setStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionComplete, setTransactionComplete] = useState<boolean>(false);
  const [ethAmount, setEthAmount] = useState<string>("0");

  // Exchange rate: 1 ETH = 12,500 MYR (approximate)
  const exchangeRate = 12500;

  // Calculate ETH equivalent whenever MYR amount changes
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const eth = parseFloat(value) / exchangeRate;
    setEthAmount(eth.toFixed(6));
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        setTransactionComplete(true);
        setStep(3);
      }, 3000);
    }
  };

  const handleNewTransaction = () => {
    setAmount("100");
    setPaymentMethod("tng");
    setStep(1);
    setTransactionComplete(false);
    setEthAmount("0.008");
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "tng": return "Touch 'n Go eWallet";
      case "grab": return "GrabPay";
      case "boost": return "Boost";
      case "maybank": return "MAE by Maybank";
      default: return "Select a payment method";
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
        <div className="w-full bg-gradient-to-r from-teal-600 to-green-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="container max-w-2xl mx-auto text-center">
                <h1 className="text-white font-bold text-xl md:text-2xl">
                Our Integrated On-Ramp Services, Simplified
                </h1>
                <p className="text-teal-50 text-sm mt-1">
                Quick and secure conversion from MYR to ETH for seamless donations
                </p>
            </div>
        </div>
      <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Convert MYR to ETH</CardTitle>
          <CardDescription>
            Purchase Ethereum using your Malaysian e-wallet for instant donations
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (MYR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    RM
                  </span>
                  <Input 
                    className="pl-10" 
                    type="number" 
                    placeholder="100" 
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  You will receive approximately <span className="font-mono font-medium">{ethAmount} ETH</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Payment Method</label>
                <Tabs defaultValue="ewallet" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ewallet">E-Wallet</TabsTrigger>
                    <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ewallet" className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant={paymentMethod === "tng" ? "default" : "outline"}
                        className={`flex flex-col items-center justify-center h-24 cursor-pointer ${paymentMethod === "tng" ? "bg-gradient-to-r from-teal-500 to-teal-600" : ""}`}
                        onClick={() => setPaymentMethod("tng")}
                      >
                        <div className="h-10 w-10 bg-blue-500 rounded-full mb-2 flex items-center justify-center text-white font-bold">TnG</div>
                        <span className="text-xs">Touch 'n Go</span>
                      </Button>
                      
                      <Button 
                        variant={paymentMethod === "grab" ? "default" : "outline"}
                        className={`flex flex-col items-center justify-center h-24 cursor-pointer ${paymentMethod === "grab" ? "bg-gradient-to-r from-teal-500 to-teal-600" : ""}`}
                        onClick={() => setPaymentMethod("grab")}
                      >
                        <div className="h-10 w-10 bg-green-500 rounded-full mb-2 flex items-center justify-center text-white font-bold">G</div>
                        <span className="text-xs">GrabPay</span>
                      </Button>
                      
                      <Button 
                        variant={paymentMethod === "boost" ? "default" : "outline"}
                        className={`flex flex-col items-center justify-center h-24 cursor-pointer ${paymentMethod === "boost" ? "bg-gradient-to-r from-teal-500 to-teal-600" : ""}`}
                        onClick={() => setPaymentMethod("boost")}
                      >
                        <div className="h-10 w-10 bg-orange-500 rounded-full mb-2 flex items-center justify-center text-white font-bold">B</div>
                        <span className="text-xs">Boost</span>
                      </Button>
                      
                      <Button 
                        variant={paymentMethod === "maybank" ? "default" : "outline"}
                        className={`flex flex-col items-center justify-center h-24 cursor-pointer ${paymentMethod === "maybank" ? "bg-gradient-to-r from-teal-500 to-teal-600" : ""}`}
                        onClick={() => setPaymentMethod("maybank")}
                      >
                        <div className="h-10 w-10 bg-yellow-500 rounded-full mb-2 flex items-center justify-center text-white font-bold">M</div>
                        <span className="text-xs">MAE</span>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="bank" className="pt-4">
                    <p className="text-center text-gray-500 my-8">Bank transfer options coming soon.</p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Exchange Rate Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Current rate: 1 ETH = RM {exchangeRate.toLocaleString()}</p>
                      <p>Fee: 1.5% (Included in the displayed rate)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-md p-4 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">You're converting</span>
                  <span className="font-medium">RM {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Payment method</span>
                  <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Fee</span>
                  <span className="font-medium">RM {(parseFloat(amount) * 0.015).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">You will receive</span>
                    <span className="font-bold">{ethAmount} ETH</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800">
                  Next steps:
                </h3>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700">
                  <li>You'll be redirected to your e-wallet app for payment</li>
                  <li>Once payment is complete, the ETH will be sent to your wallet</li>
                  <li>Please don't close this window during the process</li>
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200">
                <Check className="h-5 w-5 text-emerald-600" />
                <AlertTitle>Transaction Complete!</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Your purchase of {ethAmount} ETH was successful.</p>
                  <p className="text-xs">Transaction ID: 0x{Math.random().toString(16).substring(2, 10)}...{Math.random().toString(16).substring(2, 10)}</p>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Amount converted</span>
                  <span className="font-medium">RM {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Payment method</span>
                  <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ETH received</span>
                    <span className="font-bold">{ethAmount} ETH</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">What's next?</h3>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Wallet className="h-4 w-4" /> View in wallet
                </Button>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600">
                  Continue to donate
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {step < 3 ? (
            <Button 
              onClick={handleContinue} 
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 cursor-pointer "
              disabled={isProcessing || !amount || parseFloat(amount) <= 0 || !paymentMethod}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : step === 1 ? "Continue" : "Confirm and Pay"}
            </Button>
          ) : (
            <Button 
              onClick={handleNewTransaction} 
              variant="outline" 
              className="w-full"
            >
              Make another conversion
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="text-center mt-4 text-xs text-gray-500">
        <p>Powered by BlockChair On-Ramp Service • For demonstration purposes only</p>
      </div>
    </div>
  );
}