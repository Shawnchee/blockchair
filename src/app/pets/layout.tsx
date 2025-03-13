import type React from "react";
import "@/app/globals.css"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
// import Header from "@/components/header";
// import Footer from "@/components/footer";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Virtual Pet Gamification",
  description: "Adopt, care for, and dress up your virtual pet while making real-world donations.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} font-nunito min-h-screen bg-background antialiased`}>
        {/* <ThemeProvider attribute="class" defaultTheme="light"> */}
          <div className="relative flex min-h-screen flex-col">
            {/* <Header /> */}
            <div className="flex-1">
                <div className="container ml-auto mr-auto">
                    {children}
                </div>
            {/* <Footer /> */}
            </div>
          </div>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}

