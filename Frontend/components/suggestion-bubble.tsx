"use client"

import { useState } from "react"
import type { Suggestion } from "@/types/document"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface SuggestionBubbleProps {
  suggestion: Suggestion
}

export default function SuggestionBubble({ suggestion }: SuggestionBubbleProps) {
  const [isResolved, setIsResolved] = useState(false)

  const handleAccept = () => {
    setIsResolved(true)
    // In a real app, you'd apply the suggestion to the document
  }

  const handleReject = () => {
    setIsResolved(true)
    // In a real app, you'd remove the suggestion
  }

  if (isResolved) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="mb-4"
    >
      <Card className="p-4 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-start space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={suggestion.author.avatarUrl} alt={suggestion.author.name} />
            <AvatarFallback>{suggestion.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{suggestion.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(suggestion.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 text-sm">{suggestion.content}</p>
            <div className="mt-2 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleReject}>
                Reject
              </Button>
              <Button variant="default" size="sm" onClick={handleAccept}>
                Accept
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

