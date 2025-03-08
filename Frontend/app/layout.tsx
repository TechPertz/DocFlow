"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useIsDesktop } from "@/hooks/useIsDesktop"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    // First check session storage for current tab
    const sessionUser = typeof window !== 'undefined' ? sessionStorage.getItem("user") : null
    if (sessionUser) {
      setIsLoading(false)
      return
    }

    // If no session data, check cookie for auto-login
    const userCookie = Cookies.get("user")
    if (!userCookie && pathname !== "/login") {
      router.push("/login")
    } else if (userCookie) {
      // Copy cookie data to session storage for this tab
      sessionStorage.setItem("user", userCookie)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [pathname, router])

  useEffect(() => {
    setSidebarOpen(isDesktop)
  }, [isDesktop])

  if (isLoading) {
    return <div>Loading...</div> // or a more sophisticated loading spinner
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Document Approval</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {pathname === "/login" ? (
            children
          ) : (
            <div className="flex min-h-screen w-full">
              <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div className="flex-1 flex flex-col h-screen w-full">
                <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                      <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-auto p-4">
                  {children}
                </main>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
