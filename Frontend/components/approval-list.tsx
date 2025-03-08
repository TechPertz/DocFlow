"use client"

import Link from "next/link"
import type { Document } from "@/types/document"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, FileText } from "lucide-react"
import { motion } from "framer-motion"
import DocumentStatusBadge from "@/components/document-status-badge"
import ApprovalHistoryDialog from "@/components/approval-history-dialog"
import { useState } from "react"

interface ApprovalListProps {
  documents: Document[]
  status: "pending" | "approved" | "rejected"
}

export default function ApprovalList({ documents, status }: ApprovalListProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Mock history data - In a real app, this would come from your backend
  const mockHistory = [
    {
      id: "1",
      status: "pending" as const,
      timestamp: new Date().toISOString(),
      user: {
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: "/avatars/john.jpg"
      },
      comment: "Pending review of the latest changes"
    },
    {
      id: "2",
      status: "approved" as const,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
        avatarUrl: "/avatars/jane.jpg"
      },
      comment: "Changes look good, approved!"
    }
  ]

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 flex-col items-center justify-center p-6">
          <p className="text-center text-muted-foreground">No {status} documents found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {documents.map((document, index) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => setSelectedDocument(document)}
            className="cursor-pointer"
          >
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{document.title}</span>
                  </div>
                  <DocumentStatusBadge status={document.status} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {document.excerpt || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={document.author?.avatarUrl} alt={document.author?.name} />
                    <AvatarFallback>{document.author?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{document.author?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <ApprovalHistoryDialog
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        documentTitle={selectedDocument?.title || ""}
        history={mockHistory}
      />
    </>
  )
}