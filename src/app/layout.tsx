import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SolanaProvider from "./context/SolanaProvider";
import ChatbotComponent from "@/components/chatbotComponent";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlockChair",
  description: "BlockChair is a revolutionary platform that leverages blockchain technology to bring transparency and efficiency to charitable donations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >


        <SolanaProvider>
          <Navbar/>
          {children}
          <ChatbotComponent/>
          <Footer/>
          </SolanaProvider>
        

      </body>

    </html>
  );
}
