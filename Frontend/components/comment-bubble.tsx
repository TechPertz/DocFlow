"use client"

import { useState } from "react"
import type { Comment } from "@/types/document"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface CommentBubbleProps {
  comment: Comment
}

export default function CommentBubble({ comment }: CommentBubbleProps) {
  const [isResolved, setIsResolved] = useState(false)

  const handleResolve = () => {
    setIsResolved(true)
    // In a real app, you'd update the comment status on the server
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
            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{comment.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
            <p className="mt-1 text-sm">{comment.content}</p>
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleResolve}>
                Resolve
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

