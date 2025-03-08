"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatDialogProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
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

export default function ChatDialog({ isOpen, onClose, documentId }: ChatDialogProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] p-4">
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
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

