"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useAnimation, useMotionValue } from "framer-motion"

const features = [
    {
        "title": "Create & Connect Your Wallet",
        "description": "Set up a MetaMask wallet, secure your keys, and connect it to BlockChair to start donating securely.",
        "icon": "🔗"
      },
      {
        "title": "Making Your First Donation",
        "description": "Follow a step-by-step guide on selecting a cause, donating in ETH, and tracking your contributions on the blockchain.",
        "icon": "🎁"
      },
      {
        "title": "Understanding Smart Contracts",
        "description": "Learn how BlockChair’s milestone-based smart contracts ensure that funds are released only when goals are met.",
        "icon": "📜"
      },
      {
        "title": "Verifying Charity Legitimacy",
        "description": "Discover how AI-powered verification and wallet analysis help ensure your donations go to trustworthy charities.",
        "icon": "✅"
      },
      {
        "title": "Earning & Using Donation Rewards",
        "description": "Find out how to earn donation coins and use them to customize virtual pets, engage in community events, and more!",
        "icon": "🎮"
      }
]

export default function FeatureCarousel() {
  const [width, setWidth] = useState(0)
  const carousel = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimation()

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth)
    }
  }, [])

  const handleDragEnd = () => {
    const currentX = x.get()
    if (currentX > 0) {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } })
    } else if (currentX < -width) {
      controls.start({ x: -width, transition: { type: "spring", stiffness: 300, damping: 30 } })
    }
  }

  return (
    <div className="py-10 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-center mb-12 text-foreground">Useful Guides</h2>
        <motion.div ref={carousel} className="cursor-grab overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            animate={controls}
            style={{ x }}
            onDragEnd={handleDragEnd}
            className="flex"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="min-w-[300px] h-[400px] p-8 m-4 bg-background rounded-3xl shadow-lg flex flex-col justify-between hover-lift transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary/10"
              >
                <div>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
                <div className="mt-4">
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Learn more →
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

