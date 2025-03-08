"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface ChatMessage {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  createdAt: string
}

interface ChatSectionProps {
  documentId: string
}

export default function ChatSection({ documentId }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulating fetching chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        content: "Hey team, what do you think about the new changes?",
        author: {
          id: "user1",
          name: "Alice Johnson",
          avatarUrl: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-06-15T10:30:00Z",
      },
      {
        id: "2",
        content: "Looks good to me! @Bob, can you review the last section?",
        author: {
          id: "user2",
          name: "John Doe",
          avatarUrl: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-06-15T10:35:00Z",
      },
      {
        id: "3",
        content: "Sure, I'll take a look right away.",
        author: {
          id: "user3",
          name: "Bob Smith",
          avatarUrl: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-06-15T10:40:00Z",
      },
    ]
    setMessages(mockMessages)
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newChatMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      author: {
        id: "current-user",
        name: "You",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      createdAt: new Date().toISOString(),
    }

    setMessages([...messages, newChatMessage])
    setNewMessage("")

    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    })
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-4 flex items-start gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.author.avatarUrl} alt={message.author.name} />
                <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">{message.author.name}</span>
                  <span className="text-xs text-indigo-500 dark:text-indigo-400">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-sm bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
      <div className="border-t border-indigo-200 dark:border-indigo-800 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-full bg-white/50 dark:bg-gray-800/50"
          />
          <Button type="submit" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

