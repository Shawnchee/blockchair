"use client" // Only needed in Next.js App Router

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X, ArrowRight, Calendar, Users, Heart, Sparkles } from "lucide-react"
import AISmartDonation from "@/components/ai-smart-donation"
import { Button } from "@/components/ui/button"
import supabase from "@/utils/supabase/client"

interface DonationProps {
  id: number
  title: string
  location: string
  cover_image: string
  total_amount: number
  organization_name: string
}

const DonationCard: React.FC<DonationProps> = ({ id, title, location, cover_image, total_amount, organization_name }) => (
  <Link href={`/charity/browse-projects/${id}`} passHref>
    <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={cover_image || "/placeholder.svg?height=160&width=320&text=Project+Image"}
          alt={title}
          className="w-full h-40 object-cover"
        />
        <span className="absolute bottom-2 left-2 bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
          {location}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mt-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2 flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {organization_name || "Anonymous Organization"}
        </p>
        <p className="text-teal-600 font-bold mt-2 flex items-center">
          <Heart className="h-4 w-4 mr-1 fill-teal-600 stroke-teal-600" />$
          {total_amount ? total_amount.toLocaleString() : "0"} goal
        </p>
      </div>
    </div>
  </Link>
)

const SuccessDialog = ({ onClose }: { onClose: () => void }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center">
              <div className="bg-white rounded-full p-3 mr-4">
                <CheckCircle className="h-8 w-8 text-teal-500" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">Project Listed!</h3>
                <p className="text-teal-100 text-sm">Your project is now live</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Congratulations! Your charity project has been successfully listed on our platform. Donors can now
              discover and support your cause.
            </p>

            <div className="bg-teal-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-teal-800 mb-3">What's next?</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-teal-100 rounded-full p-1 mr-3 mt-0.5">
                    <Users className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-sm text-teal-700">
                    Share your project with your network to gain initial support
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-teal-100 rounded-full p-1 mr-3 mt-0.5">
                    <Calendar className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-sm text-teal-700">
                    Update your project regularly with progress and milestones
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                View All Projects
              </Button>
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" asChild>
                <Link href="/charity/start-project">
                  Create Another <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const DonationPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [donations, setDonations] = useState<DonationProps[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)

  useEffect(() => {
    // Check if success parameter is present
    const success = searchParams.get("success")
    if (success === "true") {
      setShowSuccess(true)
    }

    const fetchDonations = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("charity_2").select("*")
      if (error) {
        console.error("Error fetching donations:", error.message)
      } else {
        setDonations(data || [])
      }
      setLoading(false)
    }

    fetchDonations()
  }, [searchParams])

  const closeSuccessDialog = () => {
    setShowSuccess(false)
    // Remove the success parameter from the URL
    router.replace("/charity/browse-projects")
  }

  return (
    <div className="container mx-auto pt-24 pb-8 min-h-screen px-4">
      {showSuccess && <SuccessDialog onClose={closeSuccessDialog} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Fundraisers</h2>
          <p className="text-gray-600">Discover and support charitable projects making a difference</p>
        </div>

        <Button className="mt-4 md:mt-0 bg-teal-600 hover:bg-teal-700" asChild>
          <Link href="/charity/start-project">Start a Project</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white shadow-lg rounded-lg overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 w-20 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
            <Heart className="h-10 w-10 text-teal-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Be the first to create a charity project and start making a difference today.
          </p>
          <Button className="bg-teal-600 hover:bg-teal-700" asChild>
            <Link href="/charity/start-project">Start a Project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard key={donation.id} {...donation} />
          ))}
        </div>
      )}

      {/* Personalized Recommendations Section */}
      <div className="mt-16 bg-teal-50 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-teal-100 rounded-full p-3">
            <Sparkles className="h-8 w-8 text-teal-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Don't know what to donate to?</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Let us know your interests and values, and we'll give you personalized charity recommendations.
        </p>
      <AISmartDonation />
      </div>
    </div>
  )
}

export default DonationPage