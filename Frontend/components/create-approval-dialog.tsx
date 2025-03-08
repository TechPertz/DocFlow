"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDocuments } from "@/hooks/use-documents"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  username: string
  organization: string
}

interface CreateApprovalDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateApprovalDialog({
  isOpen,
  onClose,
}: CreateApprovalDialogProps) {
  const [selectedDocument, setSelectedDocument] = useState("")
  const [selectedApprover, setSelectedApprover] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvers, setApprovers] = useState<User[]>([])
  const { documents, updateDocument } = useDocuments()
  const { toast } = useToast()

  // Show all documents for approval
  const availableDocuments = documents

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        // Get current user's organization from session storage
        const sessionUser = sessionStorage.getItem("user")
        if (!sessionUser) return
        
        const { organization } = JSON.parse(sessionUser)
        
        // Fetch users from the same organization
        const response = await fetch(`/api/users?organization=${organization}`)
        if (!response.ok) throw new Error('Failed to fetch approvers')
        
        const users = await response.json()
        setApprovers(users)
      } catch (error) {
        console.error('Error fetching approvers:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load approvers. Please try again.",
        })
      }
    }

    if (isOpen) {
      fetchApprovers()
    }
  }, [isOpen, toast])

  const handleSubmit = async () => {
    if (!selectedDocument || !selectedApprover) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a document and an approver.",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await updateDocument({
        id: selectedDocument,
        status: "todo",
        assignedTo: selectedApprover,
      })

      toast({
        title: "Success",
        description: "Approval request created successfully.",
      })
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create approval request.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Approval Request</DialogTitle>
          <DialogDescription>
            Select a document and assign an approver to create a new approval request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document</label>
            <Select
              value={selectedDocument}
              onValueChange={setSelectedDocument}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.title} ({doc.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Approver</label>
            <Select
              value={selectedApprover}
              onValueChange={setSelectedApprover}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an approver" />
              </SelectTrigger>
              <SelectContent>
                {approvers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 