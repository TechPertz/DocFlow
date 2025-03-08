"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Comment } from "@/types/document"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CommentSectionProps {
  comments: Comment[]
  documentId: string
}

export default function CommentSection({ comments: initialComments, documentId }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `temp-${Date.now()}`,
      content: newComment,
      author: {
        id: "current-user",
        name: "You",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      createdAt: new Date().toISOString(),
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <AnimatePresence initial={false}>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-20 items-center justify-center rounded-lg border border-indigo-200 dark:border-indigo-800"
            >
              <p className="text-sm text-indigo-500 dark:text-indigo-400">No comments yet</p>
            </motion.div>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="mb-4 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-indigo-700 dark:text-indigo-300">{comment.author.name}</h4>
                      <span className="text-xs text-indigo-500 dark:text-indigo-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </ScrollArea>
      <div className="border-t border-indigo-200 dark:border-indigo-800 p-4">
        <div className="flex gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your Avatar" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none rounded-lg bg-white/50 dark:bg-gray-800/50"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

