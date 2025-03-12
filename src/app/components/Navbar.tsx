"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "../styles/Navbar.module.css";


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
          <li><Link href="/about" className={styles.navItem} onClick={() => setIsOpen(false)}>About</Link></li>
          <li><Link href="/services" className={styles.navItem} onClick={() => setIsOpen(false)}>Services</Link></li>
          <li><Link href="/wallet" className={styles.navItem} onClick={() => setIsOpen(false)}>Connect Wallet</Link></li>
        </ul>

        {/* Mobile Menu Button */}
        <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}
