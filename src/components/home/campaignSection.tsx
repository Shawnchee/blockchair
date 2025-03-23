"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Shield, Users, Smartphone, Award, Heart } from "lucide-react"

// Campaign type definition
interface Campaign {
  id: number;
  title: string;
  description: string;
  raised: number;
  goal: number;
  progress: number;
  image: string;
}

// Feature type definition
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Sample campaign data
const campaigns: Campaign[] = [
  {
    id: 1,
    title: "Save Thousands of Abandoned Animals",
    description:
      "Every year, countless animals are abandoned and left to fend for themselves. These animals often face hunger, thirst, disease, and danger. Fortunately, there are many ways in which you can help these animals.",
    raised: 4174,
    goal: 15000,
    progress: 25,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 2,
    title: "Help Us Provide Access to Education",
    description:
      "Education is one of the most important factors that contribute to the growth and development of individuals and societies. By donating to educational initiatives or organizations that support education.",
    raised: 6125,
    goal: 9000,
    progress: 68,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 3,
    title: "Support and Help Cancer Fighters",
    description:
      "Cancer patients and their families often face significant challenges during treatment, including financial burdens, emotional stress, and physical discomfort. Your donation can help provide essential services.",
    raised: 7789,
    goal: 15000,
    progress: 52,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 4,
    title: "Clean Water for Rural Communities",
    description:
      "Access to clean water is a fundamental human right, yet millions of people around the world still lack this basic necessity. Your support can help build wells and water purification systems.",
    raised: 3250,
    goal: 10000,
    progress: 32,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 5,
    title: "Disaster Relief for Flood Victims",
    description:
      "Recent floods have devastated communities, leaving thousands homeless and without basic necessities. Your donation will provide emergency shelter, food, and medical care to those affected.",
    raised: 12500,
    goal: 20000,
    progress: 62,
    image: "/placeholder.svg?height=300&width=400",
  },
]

// Feature items data
const features: Feature[] = [
  {
    icon: Shield,
    title: "Secure",
    description: "Our Trust & Safety team works around the clock to protect against fraud.",
  },
  {
    icon: Award,
    title: "Donor protection guarantee",
    description: "BlockChair has the first and only donor guarantee in the industry.",
  },
  {
    icon: Users,
    title: "Social reach",
    description: "Harness the power of social media to spread your story and get more support.",
  },
  {
    icon: Smartphone,
    title: "Mobile friendly",
    description: "The BlockChair app makes it simple to launch and manage your fundraiser on the go.",
  },
]

export default function CampaignSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const maxIndex = Math.max(0, campaigns.length - 3)

  // For mobile view, we'll show one card at a time
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false
  const mobileMaxIndex = campaigns.length - 1

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (isMobile ? (prev < mobileMaxIndex ? prev + 1 : 0) : prev < maxIndex ? prev + 1 : 0))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (isMobile ? (prev > 0 ? prev - 1 : mobileMaxIndex) : prev > 0 ? prev - 1 : maxIndex))
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Auto-scroll the carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, isAnimating])

  return (
    <div className="bg-white">
      {/* Features Section with animations */}
      <motion.div
        className="w-full bg-emerald-500 text-white py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-10"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            BlockChair has everything you need
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center md:items-start space-y-3"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <feature.icon className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-xl">{feature.title}</h3>
                <p className="text-sm text-center md:text-left">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Campaigns Section with carousel */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <motion.h2
            className="text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Recent <span className="text-emerald-500">Campaigns</span>
          </motion.h2>
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
              onClick={prevSlide}
              disabled={isAnimating}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
              onClick={nextSlide}
              disabled={isAnimating}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              }}
            >
              {/* Show either 1 card (mobile) or 3 cards (desktop) */}
              {isMobile
                ? [campaigns[currentIndex]].map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)
                : campaigns
                    .slice(currentIndex, currentIndex + 3)
                    .map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: isMobile ? campaigns.length : maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-emerald-500" : "w-2 bg-gray-300"
              }`}
              onClick={() => {
                setIsAnimating(true)
                setCurrentIndex(index)
                setTimeout(() => setIsAnimating(false), 500)
              }}
            />
          ))}
        </div>

        <motion.div
          className="flex justify-end mt-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button variant="link" className="text-emerald-500 flex items-center group hover:text-emerald-700">
            View all
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

// Campaign Card Component with animations and interactivity
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div whileHover={{ y: -5 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={campaign.image || "/placeholder.svg"}
            alt={campaign.title}
            className="object-cover w-full h-full transition-transform duration-700 ease-in-out"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-xl line-clamp-1">{campaign.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3">{campaign.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t pt-4 space-y-3">
          <div className="flex justify-between w-full">
            <p className="font-semibold">${campaign.raised.toLocaleString()} raised</p>
            <p className="text-gray-500 text-sm">of ${campaign.goal.toLocaleString()}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-emerald-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${campaign.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <motion.button
            className={`mt-3 w-full py-2 rounded-md flex items-center justify-center gap-2 transition-colors duration-300 ${
              isHovered ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-500"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart className="h-4 w-4" />
            Donate Now
          </motion.button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}