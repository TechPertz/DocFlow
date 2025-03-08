"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Document } from "@/types/document"
import { Calendar, FileText } from "lucide-react"
import DocumentStatusBadge from "@/components/document-status-badge"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface DocumentCardProps {
  document: Document
}

export default function DocumentCard({ document }: DocumentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-[280px] overflow-hidden transition-all hover:shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border-2 border-indigo-100 dark:border-indigo-900 flex flex-col">
        <Link href={`/documents/${document.id}`} passHref className="block flex-1">
          <CardContent className="h-full p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium truncate">
                  {document.type || "Document"}
                </span>
              </div>
              <DocumentStatusBadge status={document.status as "draft" | "pending" | "approved" | "rejected"} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-900 dark:text-indigo-100 line-clamp-2">
              {document.title}
            </h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 line-clamp-3">
              {document.excerpt || "No description provided"}
            </p>
          </CardContent>
        </Link>
        <CardFooter className="flex items-center justify-between border-t border-indigo-100 dark:border-indigo-900 p-4 bg-indigo-50 dark:bg-indigo-950">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={document.author?.avatarUrl} alt={document.author?.name} />
              <AvatarFallback>{document.author?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-indigo-600 dark:text-indigo-400">{document.author?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-indigo-600 dark:text-indigo-400">
              {new Date(document.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

