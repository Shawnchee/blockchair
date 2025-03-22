"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

// CountUp component for animating numbers
function CountUp({ 
  start = 0, 
  end, 
  duration = 2.5, 
  separator = ",", 
  prefix = "", 
  suffix = "" 
}: {
  start?: number;
  end: number;
  duration?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(start)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * (end - start) + start))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [start, end, duration, isInView])

  return (
    <span ref={ref}>
      {prefix}
      {count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)}
      {suffix}
    </span>
  )
}

export default function HeroSection() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Join the <span className="text-emerald-500">movement</span>
            <br />
            and be a part of
            <br />
            something bigger
          </motion.h1>

          <motion.p
            className="text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Create a culture of giving, enabling individuals and organizations to support causes that align with their
            values and make a positive impact on the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 rounded-md text-lg h-auto group transition-all duration-300 ease-in-out hover:scale-105"
            >
              Donate Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-4 pt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-bold text-emerald-500">
                <CountUp start={0} end={60} duration={2} suffix="+" />
              </h3>
              <p className="text-gray-600 text-sm mt-1">fundraises per year</p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-bold text-emerald-500">
                <CountUp start={0} end={750} duration={2.5} prefix="$" suffix=" million+" />
              </h3>
              <p className="text-gray-600 text-sm mt-1">raised per year</p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-bold text-emerald-500">
                <CountUp start={0} end={250000} duration={3} separator="," suffix="+" />
              </h3>
              <p className="text-gray-600 text-sm mt-1">fundraiser per year</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg"
              alt="People making a difference"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

            <motion.div
              className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p className="text-sm font-medium">
                "Every donation, no matter how small, has the power to change lives."
              </p>
              <p className="text-xs text-emerald-600 mt-1">— BlockChair Community</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}