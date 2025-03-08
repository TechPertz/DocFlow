import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface DocumentStatusBadgeProps {
  status: "draft" | "pending" | "approved" | "rejected"
}

export default function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-dashed">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
          Draft
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-500">
          <Clock className="h-3 w-3" />
          Pending Approval
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-500">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return null
  }
}

