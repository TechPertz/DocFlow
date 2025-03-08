"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useDocuments } from "@/hooks/use-documents"

interface CreateDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateDocumentDialog({ isOpen, onClose }: CreateDocumentDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const { createDocument } = useDocuments()
  const { toast } = useToast()

  // Update excerpt when content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    // Automatically generate excerpt from first 150 characters of content
    if (!excerpt) {
      const autoExcerpt = newContent.slice(0, 150).trim()
      setExcerpt(autoExcerpt + (newContent.length > 150 ? '...' : ''))
    }
  }

  const handleCreateDocument = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your document",
        variant: "destructive",
      })
      return
    }

    try {
      await createDocument({
        title,
        content,
        type,
        excerpt,
      })

      toast({
        title: "Document created",
        description: `"${title}" has been created successfully.`,
      })
      resetForm()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setType("")
    setExcerpt("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>Create a new document in your workspace</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Document Type</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Report, Proposal, Policy"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="excerpt">Description</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Enter a brief description (will be auto-generated from content if left empty)"
              className="min-h-[60px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Enter document content"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateDocument}>Create Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

