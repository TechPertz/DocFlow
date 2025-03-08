"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, Share2 } from "lucide-react"
import type { Document } from "@/types/document"
import ChatSection from "@/components/chat-section"
import CommentSection from "@/components/comment-section"
import ShareSection from "@/components/share-section"
import { motion } from "framer-motion"

interface DocumentSidebarProps {
  activeTab: "chat" | "comments" | "share"
  onTabChange: (tab: "chat" | "comments" | "share") => void
  document: Document
}

export default function DocumentSidebar({ activeTab, onTabChange, document }: DocumentSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 p-1 rounded-t-2xl">
          <TabsTrigger
            value="comments"
            className="flex items-center gap-2 data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900 rounded-xl transition-all duration-200"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Comments</span>
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="flex items-center gap-2 data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900 rounded-xl transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Chat</span>
          </TabsTrigger>
          <TabsTrigger
            value="share"
            className="flex items-center gap-2 data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900 rounded-xl transition-all duration-200"
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Share</span>
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden">
          <TabsContent value="comments" className="h-full">
            <CommentSection comments={document.comments || []} documentId={document.id} />
          </TabsContent>
          <TabsContent value="chat" className="h-full">
            <ChatSection documentId={document.id} />
          </TabsContent>
          <TabsContent value="share" className="h-full">
            <ShareSection documentId={document.id} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}

