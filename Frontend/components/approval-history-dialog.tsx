import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MessageSquare } from "lucide-react"

interface ApprovalHistoryEntry {
  id: string
  status: "approved" | "rejected" | "pending"
  timestamp: string
  user: {
    name: string
    email: string
    avatarUrl?: string
  }
  comment?: string
}

interface ApprovalHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  documentTitle: string
  history: ApprovalHistoryEntry[]
}

export default function ApprovalHistoryDialog({
  isOpen,
  onClose,
  documentTitle,
  history,
}: ApprovalHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approval History - {documentTitle}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.user.avatarUrl} />
                    <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{entry.user.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.user.email}</p>
                    {entry.comment && (
                      <div className="mt-2 flex items-start gap-1 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">{entry.comment}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 