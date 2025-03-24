"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet,
  CreditCard,
  Building,
  ArrowRight,
  Users,
  User,
  LucideIcon,
  FilePlus2,
  Code,
  Zap,
  Banknote,
  DollarSign,
  HeartHandshake,
  Send,
  Network,
} from "lucide-react"

// Define interfaces
interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

interface FlowStepProps {
  icon: LucideIcon
  text: string
  delay?: number
}

interface ArrowProps {
  delay?: number
}

interface FlowItem {
  id: number
  icon: LucideIcon
  text: string
}

// Tab button with enhanced interactivity
const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    className={`px-4 py-2 rounded-md transition-all duration-200 text-sm md:text-base ${
      active
        ? "bg-emerald-600 text-white shadow-sm font-semibold"
        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
    }`}
  >
    {children}
  </motion.button>
)

// Flow step card
const FlowStep: React.FC<FlowStepProps> = ({ icon: Icon, text, delay = 0 }) => (
  <motion.div
    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow flex items-center gap-4 border border-gray-100 cursor-default"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="bg-emerald-600 p-3 rounded-full shadow">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-gray-700 text-sm md:text-base">{text}</p>
  </motion.div>
)

// Arrow between steps
const Arrow: React.FC<ArrowProps> = ({ delay = 0 }) => (
  <motion.div
    className="flex justify-center items-center"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <ArrowRight className="w-8 h-8 text-gray-300" />
  </motion.div>
)

export default function DonationFlowSection() {
  const [activeTab, setActiveTab] = useState<"individuals" | "ngos">("individuals")

  const flowData: Record<"individuals" | "ngos", FlowItem[]> = {
    individuals: [
      {
        id: 1,
        icon: DollarSign,
        text: "The donor converts fiat currency into ETH.",
      },
      {
        id: 2,
        icon: Wallet,
        text: "ETH is deposited into the donor’s smart wallet.",
      },
      {
        id: 3,
        icon: HeartHandshake,
        text: "The donor selects a donation project to support.",
      },
      {
        id: 4,
        icon: Send,
        text: "The donor initiates the donation by sending ETH to the project’s smart contract.",
      },
      {
        id: 5,
        icon: Network,
        text: "The smart contract automatically distributes funds to the wallet addresses of verified executing organizations.",
      },
    ],
    ngos: [
      {
        id: 1,
        icon: FilePlus2,
        text: "NGOs set up a donation project by defining the goal, timeline, and structure.",
      },
      {
        id: 2,
        icon: Users,
        text: "Specify milestone proportions and assign wallet addresses to responsible organizations.",
      },
      {
        id: 3,
        icon: Code,
        text: "The smart contract is deployed with all conditions encoded, including fund distribution rules.",
      },
      {
        id: 4,
        icon: Zap,
        text: "Once milestones are achieved or the project reaches maturity, the contract is triggered.",
      },
      {
        id: 5,
        icon: Banknote,
        text: "Funds are automatically distributed to each party based on the agreed proportions including their share of marketing funds",
      },
    ],
  }

  return (
    <section className="w-full py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-10 flex-col md:flex-row gap-6">
            <motion.h2
              className="text-3xl font-bold text-center md:text-left"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Donation Flow
            </motion.h2>

            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <TabButton active={activeTab === "ngos"} onClick={() => setActiveTab("ngos")}>
                NGOs
              </TabButton>
              <TabButton active={activeTab === "individuals"} onClick={() => setActiveTab("individuals")}>
                Individuals
              </TabButton>
            </motion.div>
          </div>

          {/* Flow section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                <FlowStep {...flowData[activeTab][0]} delay={0.1} />
                <Arrow delay={0.2} />
                <FlowStep {...flowData[activeTab][1]} delay={0.3} />
                <Arrow delay={0.4} />
                <FlowStep {...flowData[activeTab][2]} delay={0.5} />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                <FlowStep {...flowData[activeTab][3]} delay={0.6} />
                <Arrow delay={0.7} />
                <FlowStep {...flowData[activeTab][4]} delay={0.8} />
                <div className="hidden md:block col-span-2"></div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
