"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const FAQ = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left font-medium text-primary"
      >
        {question}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <p className="mt-2 text-gray-700">{answer}</p>}
    </div>
  );
};

export default function WhyUs() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By using BlockChair, you agree to comply with our Terms & Conditions and Privacy Policy. If you disagree with any part, we kindly ask you to discontinue use.",
    },
    {
      title: "2. Description of Service",
      content: (
        <>
          <p>BlockChair empowers users to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Explore and support verified charitable projects via blockchain.</li>
            <li>Use on-chain tools to validate legitimacy and impact.</li>
            <li>Host your own cause with full transparency.</li>
          </ul>
          <p className="mt-2">
            Our platform combines smart contracts, wallet analysis, and community vetting to ensure every donation counts.
          </p>
        </>
      ),
    },
    {
      title: "3. User Responsibilities",
      content:
        "To use BlockChair, you must be 18+ or have guardian permission. All users are expected to engage respectfully and uphold the integrity of the platform. Misuse, fraud, or malicious activity is strictly prohibited.",
    },
    {
      title: "4. Donations",
      content:
        "Every donation is final and sent directly to the intended smart contract. While we verify projects, we cannot guarantee success — only transparency. Choose wisely and give with purpose.",
    },
    {
      title: "5. Wallet & Security",
      content:
        "Security is in your hands. While we provide tools like the Wallet Security Analyzer and contract audits, we never access your private keys. Practice safe wallet habits, use hardware wallets where possible, and never share your seed phrase.",
    },
  ];

  return (
    <div className="container mx-auto pt-24 pb-8 p-6 min-h-screen">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-3xl font-extrabold text-primary">Why Choose BlockChair?</CardTitle>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 text-base leading-relaxed text-gray-700">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <p className="text-gray-600 mb-2">
              <strong>Effective Date:</strong> July 3, 2025
            </p>
            <p>
              Welcome to <strong>BlockChair</strong> — your gateway to a new era of transparent, blockchain-based charitable giving.
            </p>
          </motion.div>

          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={index + 1}
            >
              <h2 className="text-xl font-semibold mt-4 mb-2">{section.title}</h2>
              <div>{section.content}</div>
            </motion.div>
          ))}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={sections.length + 1}
          >
            <h2 className="text-xl font-semibold mt-6 mb-2">Frequently Asked Questions</h2>
            <div className="divide-y">
              <FAQ
                question="Is my donation traceable?"
                answer="Yes! Every donation is recorded on-chain. You can view transaction history and verify where funds are allocated."
              />
              <FAQ
                question="Can I start my own charity project?"
                answer="Absolutely. After completing KYC verification and a project audit, you can launch a fully transparent campaign with smart contract support."
              />
              <FAQ
                question="What currencies are supported?"
                answer="We currently support ETH, USDC, and MATIC. Support for more tokens is on the roadmap!"
              />
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
