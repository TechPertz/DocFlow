"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface WelcomeBannerProps {
  onCreateDocument: () => void
}

export default function WelcomeBanner({ onCreateDocument }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
    >
      <div className="relative z-10 p-8">
        <h2 className="text-3xl font-bold mb-2">Welcome to DocFlow</h2>
        <p className="text-lg mb-4">Manage and collaborate on documents with your team</p>
        <Button onClick={onCreateDocument} className="rounded-full bg-white text-indigo-600 hover:bg-indigo-100">
          <Plus className="mr-2 h-4 w-4" />
          Create Document
        </Button>
      </div>
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 0 L100 100 L100 0 Z" fill="white" />
          <path d="M0 100 L100 0 L0 0 Z" fill="white" />
        </svg>
      </div>
    </motion.div>
  )
}

