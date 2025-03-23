import type { Metadata } from "next"
import FAQAccordion from "@/components/faq-accordion"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | BlockChair",
  description:
    "Find answers to common questions about BlockChair's blockchain charity platform, donations, security, and more.",
}

export default function FAQPage() {
  return (
    <div className="container max-w-5xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find answers to common questions about BlockChair's blockchain charity platform, how it works, and how you can
          get involved.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <FAQAccordion />
      </div>

      <div className="mt-16 mb-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still have questions?</h2>
        <p className="text-gray-600 mb-6">
          Our team is here to help. Reach out to us through any of the channels below.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
          >
            Contact Support
          </a>
          <a
            href="mailto:support@blockchair.com"
            className="inline-flex items-center justify-center px-6 py-3 border border-teal-600 text-base font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 transition-colors"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  )
}

