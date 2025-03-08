"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to login')
      }

      const userData = await response.json()

      // Store user info in session storage for current tab
      sessionStorage.setItem("user", JSON.stringify(userData))
      
      // Store minimal info in cookie for auto-login in new tabs
      Cookies.set("user", JSON.stringify(userData), { expires: 7 })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error('Error during login:', error)
      alert('An error occurred during login. Please try again.')
    }
  }

  useEffect(() => {
    // First check session storage for current tab data
    const sessionUser = sessionStorage.getItem("user")
    if (sessionUser) {
      router.push("/")
      return
    }

    // If no session data, check cookie for auto-login
    const userCookie = Cookies.get("user")
    if (userCookie) {
      // Copy cookie data to session storage for this tab
      sessionStorage.setItem("user", userCookie)
      router.push("/")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-indigo-100 dark:border-indigo-900 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">DocFlow</CardTitle>
            <CardDescription>Enter your email to sign in to your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="username@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

