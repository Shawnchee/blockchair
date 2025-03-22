"use client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function OurApproachSection() {
  return (
    <section className="w-full py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        {/* Card-style wrapper for the full section */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-12 flex-col md:flex-row gap-6">
            <motion.h2
              className="text-3xl font-bold text-center md:text-left"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our Approach
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Donate Now
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              {
                title: "Direct Giving",
                content: (
                  <>
                    We transfer your donation directly to the end beneficiary — meaning{" "}
                    <span className="text-emerald-600 font-medium">100%</span> of your money goes to those who need it most.
                  </>
                ),
                delay: 0,
              },
              {
                title: "Transparency",
                content:
                  "We revolutionize global giving by making it more transparent to address challenges facing the social sector such as corruption, lack of trust in nonprofits, high global transfer fees, inefficient processes and lack of accountability in donor spending.",
                delay: 0.1,
              },
              {
                title: "Transformative Tech",
                content:
                  "We believe tech should serve people so we repurpose emerging tech as tools for social change.",
                delay: 0.2,
              },
              {
                title: "Research",
                content:
                  "To better understand and support Web 3 solutions, we invest in the innovation, research and development of it.",
                delay: 0.3,
              },
            ].map(({ title, content, delay }, i) => (
              <motion.div
                key={i}
                className="p-6 bg-gray-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
              >
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-700">{content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
