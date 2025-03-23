"use client"

import type React from "react"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// FAQ data structure
const faqData = [
  {
    question: "What is BlockChair and how does it work?",
    answer:
      "BlockChair is a blockchain-based charity platform that empowers donors to contribute securely and transparently to charitable causes. By leveraging smart contracts, donations are distributed fairly, and every transaction is recorded on an immutable ledger.",
  },
  {
    question: "How does blockchain technology ensure transparency and accountability?",
    answer:
      "Our platform uses blockchain to maintain a tamper-proof ledger. This means every donation, allocation, and disbursement is recorded on a decentralized network, ensuring complete transparency and accountability throughout the entire process.",
  },
  {
    question: "What role do smart contracts play in your system?",
    answer:
      "Smart contracts automate the distribution of donations according to pre-defined rules. Once conditions are met (for example, donation thresholds or fundraising goals), the contracts execute automatically, ensuring that funds reach the intended beneficiaries quickly and fairly.",
  },
  {
    question: "Which blockchain technology are you using?",
    answer:
      "For our development and testing phases, we utilize the Ethereum Sepolia testnet along with integration through MetaMask. This enables secure transactions and paves the way for scalable, production-level deployments in the future.",
  },
  {
    question: "How do I make a donation?",
    answer:
      "Simply connect your MetaMask wallet, select the charity or cause you'd like to support, and follow the on-screen instructions to donate. Your transaction will be securely processed through a smart contract, ensuring your funds are allocated as intended.",
  },
  {
    question: "How does your AI enhance the charity experience?",
    answer: `We've integrated several AI-powered tools:

1. **AI Company Check**: Analyzes charities and partner companies to ensure they meet compliance and transparency standards.

2. **AI Wallet Endpoint Analyzer**: Monitors wallet activity to detect and flag any unusual transactions.

3. **Personalized Recommendations**: Uses donor history and preferences to suggest charities that align with your values.

4. **Fundraising Goal Suggestions**: Leverages data from existing charities to help organizations set realistic and impactful fundraising targets.`,
  },
  {
    question: "What is the virtual pet gamification feature?",
    answer:
      "To boost user engagement, our platform features a virtual pet that you can nurture and customize. Every donation earns you coins, which you can use to purchase items for your pet. It's a fun way to see your charitable contributions rewarded while making a difference.",
  },
  {
    question: "Is my donation secure?",
    answer:
      "Absolutely. By leveraging blockchain's decentralized nature and using smart contracts, your donation is encrypted and recorded immutably. This ensures both the security of your funds and the transparency of their usage.",
  },
  {
    question: "Can I track how my donation is used?",
    answer:
      "Yes. Every donation is recorded on the blockchain, allowing you to track its journey from your wallet to the charitable organization. Our user dashboard provides real-time updates on how funds are allocated and spent.",
  },
  {
    question: "How can I get started?",
    answer:
      "Simply sign up on our website, connect your MetaMask wallet, and explore our curated list of verified charities. From there, you can begin donating, earn rewards through our gamification system, and enjoy personalized recommendations tailored to your interests.",
  },
  {
    question: "What if I have further questions or need support?",
    answer:
      'Our support team is here to help. Visit our "Contact Us" page for live chat options, email support, or FAQs that are continuously updated with new information.',
  },
]

export default function FAQAccordion() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Filter FAQs based on search query
  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // If search is not empty, expand all matching items
    if (query.trim() !== "") {
      setExpandedItems(filteredFAQs.map((_, index) => `item-${index}`))
    } else {
      setExpandedItems([])
    }
  }

  return (
    <div>
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 py-3 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
        />
      </div>

      {filteredFAQs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No FAQs match your search. Try a different query.</p>
        </div>
      ) : (
        <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems} className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-medium text-gray-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 bg-gray-50 text-gray-700 prose prose-teal max-w-none">
                <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n\n/g, "<br/><br/>") }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>These FAQs are regularly updated to reflect the latest information about our platform.</p>
        <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}

