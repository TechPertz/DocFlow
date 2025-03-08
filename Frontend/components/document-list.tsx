"use client"

import { useState } from "react"
import Link from "next/link"
import { useDocuments } from "@/hooks/use-documents"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Loader } from "lucide-react"
import DocumentCard from "@/components/document-card"
import type { Document } from "@/types/document"

interface DocumentListProps {
  documents: Document[]
  status?: string
}

export function DocumentList({ documents, status = 'all' }: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [localDocuments, setLocalDocuments] = useState(documents)
  const [isLoading, setIsLoading] = useState(false)
  const { deleteDocument } = useDocuments(status)

  // Update local documents when props change
  if (documents !== localDocuments) {
    setLocalDocuments(documents)
  }

  const filteredDocuments = localDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDelete = async (documentId: string) => {
    try {
      setIsLoading(true)
      await deleteDocument(documentId)
      setLocalDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Error deleting document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="relative bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 px-2 py-2 sm:p-4 mb-4 sm:mb-6">
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 sm:h-10 text-sm sm:text-base rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 sm:px-0">
        {filteredDocuments.map((document, index) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <DocumentCard 
              document={document} 
              status={status} 
              onDelete={() => handleDelete(document.id)}
            />
          </motion.div>
        ))}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400"
          >
            No documents found
          </motion.div>
        )}
      </div>
    </div>
  )
}

