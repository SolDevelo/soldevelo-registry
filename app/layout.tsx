import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import {
  JsonLd,
  organizationSchema,
  softwareSourceCodeSchema,
  websiteSchema,
} from "@/components/structured-data"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/config/site"
import { createMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = createMetadata({
  title: siteConfig.NAME,
  description: siteConfig.DESCRIPTION,
  canonicalUrl: "",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body className="font-sans">
        <JsonLd
          data={[organizationSchema, websiteSchema, softwareSourceCodeSchema]}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
