"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatSidePanelProps {
  documentId: string
  onClose: () => void
}

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

export default function ChatSidePanel({ documentId, onClose }: ChatSidePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        content: newMessage,
        author: {
          id: "current-user",
          name: "You",
          avatarUrl: "/placeholder.svg?height=40&width=40",
        },
        createdAt: new Date().toISOString(),
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Chat</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.author.avatarUrl} alt={message.author.name} />
              <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{message.author.name}</p>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </motion.div>
  )
}

