"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useDocumentById } from "@/hooks/use-documents"
import { Button } from "@/components/ui/button"
import DocumentEditor from "@/components/document-editor"
import { ArrowLeft, Share2, MessageCircle } from "lucide-react"
import DocumentStatusBadge from "@/components/document-status-badge"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import ChatSidePanel from "@/components/chat-side-panel"
import { DeleteButton } from "@/components/delete-button"

export default function DocumentPage() {
  const { id } = useParams()
  const { document, isLoading } = useDocumentById(id as string)
  const [isChatOpen, setIsChatOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-primary"></div>
      </div>
    )
  }

  if (!document) {
    return <div>Document not found</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen flex-col bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950"
    >
      <header className="flex items-center justify-between px-6 py-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
            >
              <ArrowLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{document.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                Last edited: {new Date(document.updatedAt).toLocaleString()}
              </span>
              <DocumentStatusBadge status={document.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageCircle className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
          >
            <Share2 className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Share
          </Button>
          <DeleteButton 
            documentId={document.id} 
            className="rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
          />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-grow overflow-auto p-6">
          <DocumentEditor
            content={document.content}
            comments={document.comments || []}
            suggestions={document.suggestions || []}
            versions={document.versions || []}
          />
        </div>
        <AnimatePresence>
          {isChatOpen && <ChatSidePanel documentId={document.id} onClose={() => setIsChatOpen(false)} />}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}

