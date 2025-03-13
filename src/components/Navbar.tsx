"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "@/components/styles/Navbar.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css"; // Ensure styles are loaded
import supabase from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Session } from '@supabase/supabase-js';


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Check session on mount and listen for auth state changes
  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes in the auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    // Cleanup the listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-teal-400 h-20 flex justify-center items-center">
      <div
        className={`${styles.container} flex justify-between items-center w-full max-w-6xl px-4`}
      >
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          BlockChair
        </Link>

        {/* Desktop Menu */}
        <ul className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
          <li>
            <Link
              href="/"
              className={styles.navItem}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={styles.navItem}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className={styles.navItem}
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="/wallet"
              className={styles.navItem}
              onClick={() => setIsOpen(false)}
            >
              Connect Wallet
            </Link>
          </li>
        </ul>

        {/* Authentication Buttons */}
        <div className={styles.walletButton}>
          {session ? (
            <>
              {/* Only show the WalletMultiButton when logged in */}
              <WalletMultiButton />
              <Button
                onClick={handleSignOut}
                className="cursor-pointer p-[24px] mx-4 bg-[#512DA8]"
              >
                Log Out
              </Button>
            </>
          ) : (
            <Link href="/authentication/login">
              <Button className="cursor-pointer mx-4 p-[24px] bg-[#512DA8]">
                Log In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}
