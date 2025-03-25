import { DonationBreakdown } from "@/components/donation/donation-breakdown"
import { LatestUpdates } from "@/components/donation/latest-updates"
import { TransactionDetails } from "@/components/donation/transaction-details"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 space-y-12">
        <DonationBreakdown />
        <TransactionDetails />
        <LatestUpdates milestoneTransactions={[]} />
      </div>
    </main>
  )
}

