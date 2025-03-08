"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, FileText, Star } from "lucide-react"
import { motion } from "framer-motion"
import DocumentStatusBadge from "@/components/document-status-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import type { Document } from "@/types/document"

interface TodoApprovalItemProps {
  document: Document
  onApprove: (id: string, rating: number, comment: string) => void
  onReject: (id: string, comment: string) => void
}

export default function TodoApprovalItem({ document, onApprove, onReject }: TodoApprovalItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const { toast } = useToast()

  const handleApprove = () => {
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please provide a rating before approving.",
      })
      return
    }

    onApprove(document.id, rating, comment)
    setIsDialogOpen(false)
    setRating(0)
    setComment("")
  }

  const handleReject = () => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment required",
        description: "Please provide a comment when rejecting a document.",
      })
      return
    }

    onReject(document.id, comment)
    setIsDialogOpen(false)
    setComment("")
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsDialogOpen(true)}
        className="cursor-pointer"
      >
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{document.title}</span>
              </div>
              <DocumentStatusBadge status={document.status as "draft" | "pending" | "approved" | "rejected"} />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Document - {document.title}</DialogTitle>
            <DialogDescription>
              Please review the document and provide your feedback.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 cursor-pointer ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Comment:</span>
              <Textarea
                placeholder="Provide your feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
