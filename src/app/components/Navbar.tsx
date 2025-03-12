"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "../styles/Navbar.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css"; // ✅ Ensure styles are loaded
import dynamic from "next/dynamic";
const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          MyBrand
        </Link>

        {/* Desktop Menu */}
        <ul className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
          <li><Link href="/" className={styles.navItem} onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link href="/donate" className={styles.navItem} onClick={() => setIsOpen(false)}>Donate</Link></li>
          <li><Link href="/profile" className={styles.navItem} onClick={() => setIsOpen(false)}>Profile</Link></li>
          <li><Link href="/wallet" className={styles.navItem} onClick={() => setIsOpen(false)}>Connect Wallet</Link></li>
        </ul>

        {/* Wallet Connect Button (Fixed) */}
        <div className={styles.walletButton}>
          <WalletButton />
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}
