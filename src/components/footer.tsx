"use client"

import type React from "react"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail, MapPin, Phone, ArrowRight, Heart } from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement newsletter subscription logic here
    alert(`Subscribed with email: ${email}`)
    setEmail("")
  }

  return (
    <footer className="bg-gradient-to-br from-teal-800 to-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center">
              <Heart className="mr-2 h-5 w-5 text-teal-300" /> About BlockChair
            </h3>
            <p className="text-teal-100 text-sm leading-relaxed">
              BlockChair is a revolutionary platform that leverages blockchain technology to bring transparency and
              efficiency to charitable donations, ensuring your contributions make the maximum impact.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-teal-200 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-teal-200 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-teal-200 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-teal-200 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-teal-200 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Help / Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/getting-started" className="text-teal-100 hover:text-white transition-colors flex items-center">
                  <ArrowRight className="mr-2 h-3 w-3" /> Getting Started
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-teal-100 hover:text-white transition-colors flex items-center"
                >
                  <ArrowRight className="mr-2 h-3 w-3" /> FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-teal-100 hover:text-white transition-colors flex items-center"
                >
                  <ArrowRight className="mr-2 h-3 w-3" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-teal-100 hover:text-white transition-colors flex items-center"
                >
                  <ArrowRight className="mr-2 h-3 w-3" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/charity/blog"
                  className="text-teal-100 hover:text-white transition-colors flex items-center"
                >
                  <ArrowRight className="mr-2 h-3 w-3" /> Blog
                </Link>
              </li>
              <li>
                <Link href="/pets" className="text-teal-100 hover:text-white transition-colors flex items-center">
                  <ArrowRight className="mr-2 h-3 w-3" /> Virtual Pet
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-teal-300 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-teal-100">
                USM VHACK Innovation Center, <br />
                Silicon Valley Tech District, <br />
                11700 Gelugor, Penang, Malaysia.
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-teal-300 mr-2 flex-shrink-0" />
                <span className="text-teal-100">+60 - 12345678</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-teal-300 mr-2 flex-shrink-0" />
                <a href="mailto:info@blockchair.com" className="text-teal-100 hover:text-white transition-colors">
                  info@blockchair.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Stay Updated</h3>
            <p className="text-teal-100 text-sm">
              Subscribe to our newsletter for the latest updates on projects, impact stories, and blockchain
              innovations.
            </p>
            <form onSubmit={handleSubscribe} className="mt-2 space-y-2">
              <div className="flex flex-col space-y-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-teal-700/50 border-teal-600 text-white placeholder:text-teal-300 focus:border-teal-400"
                />
                <Button type="submit" className="bg-teal-500 hover:bg-teal-400 text-white w-full">
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-teal-700 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-center items-center text-sm text-teal-200">
          <div className="mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} BlockChair. All rights reserved.</p>
          </div>
          </div>
        </div>
    </footer>
  )
}

