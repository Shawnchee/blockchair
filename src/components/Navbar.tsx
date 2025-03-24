"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, User, LogOut, BarChart3, Shield, Heart, PawPrint } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import "@solana/wallet-adapter-react-ui/styles.css"
import supabase from "@/utils/supabase/client"
import { Button } from "./ui/button"
import type { Session } from "@supabase/supabase-js"
import dynamic from "next/dynamic"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"
import useMetaMask from "@/hooks/useMetaMask";


const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false })

  export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [session, setSession] = useState<Session | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const { walletAddress, connectWallet } = useMetaMask();

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      const handleScroll = () => {
        setScrolled(window.scrollY > 10)
      }

      window.addEventListener("scroll", handleScroll)

      return () => {
        authListener?.subscription.unsubscribe()
        window.removeEventListener("scroll", handleScroll)
      }
    }, [])

    const handleSignOut = async () => {
      const { error } = await supabase.auth.signOut()
      if (error) console.error("Error signing out:", error)
    }

  const navLinks = [
    { name: "Why Us", href: "/why-us", icon: <BarChart3 className="w-4 h-4 mr-2"  /> },
    {
      name: "Security",
      icon: <Shield className="w-4 h-4 mr-2 " />,
      dropdown: [
        { name: "Wallet Safety Check", href: "/security/wallet-safety-check" },
        { name: "Verify Organizations", href: "/security/verify-organizations" },
      ],
    },
    {
      name: "Charity",
      icon: <Heart className="w-4 h-4 mr-2" />,
      dropdown: [
        { name: "Browse Project", href: "/charity/browse-projects" },
        { name: "Start a Project", href: "/charity/start-project" },
        { name: "AI Campaign Planner", href: "/charity/analyse" },
        { name: "Blog", href: "/charity/blog" },
      ],
    },
    { name: "Profile", href: "/profile", icon: <User className="w-4 h-4 mr-2" /> },
    {
      name: "Pet",
      icon: <PawPrint className="w-4 h-4 mr-2" />,
      dropdown: [
        { name: "My Pet", href: "/pets" },
        { name: "Marketplace", href: "/pets/marketplace" },
      ],
    },
  ]

    return (
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-md text-gray-800 shadow-md"
            : "bg-gradient-to-r from-teal-500 to-teal-600 text-white",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="relative  w-auto">
                  <Image
                    src="/logo-unscrolled.svg" // Update this path to your actual logo file
                    alt="BlockChair Logo"
                    width={80}
                    height={80}
                    className={cn(
                      "transition-opacity duration-300",
                      scrolled ? "opacity-100" : "opacity-100" // Adjust opacity if needed
                    )}
                    priority // Loads the logo with higher priority
                  />

                  {/* Optional: Add a colored version for scrolled state */}
                  {scrolled && (
                    <Image
                      src="/logo-scrolled.svg" // Optional: different version for scrolled state
                      alt="BlockChair Logo"
                      width={140}
                      height={40}
                      className="absolute inset-0 transition-opacity duration-300 opacity-100"
                      priority
                    />
                  )}
                </div>
              </Link>
            </div>

            {/* Navigation Links - Middle Section (Desktop) */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navLinks.map((link, index) => (
                <div key={index} className="relative px-1">
                  {link.dropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          scrolled ? "hover:bg-gray-100 hover:text-teal-600" : "hover:bg-teal-600/50 hover:text-white",
                        )}
                      >
                        <span className="flex items-center">
                          {link.icon}
                          {link.name}
                        </span>
                        <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        className="w-48 bg-white rounded-md shadow-lg py-1 animate-in fade-in-20 zoom-in-95 "
                      >
                        {link.dropdown.map((item, idx) => (
                          <DropdownMenuItem key={idx} asChild>
                            <Link
                              href={item.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        scrolled ? "hover:bg-gray-100 hover:text-teal-600" : "hover:bg-teal-600/50 hover:text-white",
                      )}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

          {/* Auth + Wallet - Right Section */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {session ? (
              <div className="flex items-center gap-2">
                {/* <div className="wallet-adapter-button-container ">
                    <WalletMultiButton className="!bg-teal-700 hover:!bg-teal-800 !transition-colors " />
                  </div> */}
                <div className="wallet-adapter-button-container flex justify-end px-4">
                  <button
                    onClick={connectWallet}
                    className={`px-4 py-2 rounded-lg transition-colors 
      ${walletAddress ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"}
      text-white font-semibold shadow-md`}
                    style={{ width: "auto", minWidth: "150px" }} // Prevents full width
                  >
                    {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect MetaMask"}
                  </button>
                </div>

                <Button
                  onClick={handleSignOut}
                  className="cursor-pointer p-[24px] mx-4 bg-[#512DA8]"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Link href="/authentication/login">
                <Button
                  className={cn(
                    "transition-colors",
                    scrolled ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-white text-teal-600 hover:bg-teal-50 cursor-pointer",
                  )}
                >
                  Log In
                </Button>
              </Link>
            )}
          </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              {/* {session && (
                <div className="mr-2 wallet-adapter-button-container">
                  <WalletMultiButton className="!bg-teal-700 hover:!bg-teal-800 !transition-colors !py-0 !h-9" />
                </div>
              )} */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "inline-flex items-center justify-center p-2 rounded-md transition-colors",
                  scrolled
                    ? "text-gray-700 hover:text-teal-600 hover:bg-gray-100"
                    : "text-white hover:text-white hover:bg-teal-600/50",
                )}
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-t-teal-400/20">
            {navLinks.map((link, index) => (
              <div key={index} className="py-1">
                {link.dropdown ? (
                  <div className="space-y-1">
                    <div
                      className={cn(
                        "px-3 py-2 text-base font-medium flex items-center",
                        scrolled ? "text-gray-700" : "text-white",
                      )}
                    >
                      {link.icon}
                      {link.name}
                    </div>
                    <div className="pl-6 space-y-1 border-l-2 border-teal-300/30 ml-2">
                      {link.dropdown.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className={cn(
                            "block px-3 py-2 text-sm font-medium rounded-md",
                            scrolled
                              ? "text-gray-600 hover:bg-gray-100 hover:text-teal-600"
                              : "text-teal-100 hover:bg-teal-600/50 hover:text-white",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                      scrolled
                        ? "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                        : "text-white hover:bg-teal-600/50 hover:text-white",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 pb-3 border-t border-teal-400/20">
              {session ? (
                <Button
                  onClick={handleSignOut}
                  className="cursor-pointer p-[24px] mx-4 bg-[#512DA8]"
                >
                  Log Out
                </Button>
              ) : (
                <Link href="/authentication/login" className="block w-full" onClick={() => setIsOpen(false)}>
                  <Button
                    className={cn(
                      "w-full transition-colors",
                      scrolled ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-white text-teal-600 hover:bg-teal-50",
                    )}
                  >
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

