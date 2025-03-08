"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
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

interface ApprovalActionsProps {
  id: string
}

export default function ApprovalActions({ id }: ApprovalActionsProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()

  const handleApprove = () => {
    toast({
      title: "Document approved",
      description: feedback ? "Document has been approved with feedback." : "Document has been approved.",
    })
    setIsApproveDialogOpen(false)
    setFeedback("")
  }

  const handleReject = () => {
    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Feedback required",
        description: "Please provide feedback when rejecting a document.",
      })
      return
    }

    toast({
      variant: "destructive",
      title: "Document rejected",
      description: "Document has been rejected with feedback.",
    })
    setIsRejectDialogOpen(false)
    setFeedback("")
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={() => setIsApproveDialogOpen(true)}
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="outline"
          className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => setIsRejectDialogOpen(true)}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this document? You can optionally add feedback.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Optional feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>Please provide feedback on why this document is being rejected.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Provide feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} className="gap-1">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

