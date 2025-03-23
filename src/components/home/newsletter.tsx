"use client"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"

type NewsItem = {
  id: number
  title: string
  summary: string
  image_url: string
  tag: string
  date: string
}

const CARD_WIDTH = 340 + 24 // card + gap
const CARDS_PER_PAGE = 3

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("charity_news")
        .select("*")
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching news:", error)
      } else {
        setNews(data || [])
      }
    }

    fetchNews()
  }, [])

  useEffect(() => {
    if (carouselRef.current && news.length) {
      const visibleWidth = carouselRef.current.offsetWidth
      const totalScrollable = CARD_WIDTH * news.length
      const pages = Math.ceil(totalScrollable / (CARD_WIDTH * CARDS_PER_PAGE))
      setTotalPages(pages)
    }
  }, [news])

  useEffect(() => {
    let x = 0
    const step = 1
    const interval = 20

    const autoScroll = setInterval(() => {
      if (!isHovered && carouselRef.current) {
        x -= step
        controls.start({ x, transition: { duration: interval / 1000, ease: "linear" } })

        // update current page roughly
        const page = Math.abs(Math.round(x / (CARD_WIDTH * CARDS_PER_PAGE)))
        setCurrentPage(page % totalPages)
      }
    }, interval)

    return () => clearInterval(autoScroll)
  }, [isHovered, controls, totalPages])

  const goToPage = (page: number) => {
    const offset = -page * (CARD_WIDTH * CARDS_PER_PAGE)
    controls.start({ x: offset, transition: { duration: 0.5 } })
    setCurrentPage(page)
  }

  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          News & Global Causes
        </motion.h2>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left/Right fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />

          <motion.div
            className="flex gap-6"
            ref={carouselRef}
            animate={controls}
            drag="x"
            dragConstraints={{ left: -1000, right: 0 }}
            whileTap={{ cursor: "grabbing" }}
            style={{ cursor: "grab" }}
          >
            {news.concat(news).map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                className="min-w-[300px] md:min-w-[340px] bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-sm font-medium text-emerald-600">{item.tag}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.summary}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
