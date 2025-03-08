import { Button } from "@/components/ui/button"
import { MessageSquare, Edit } from "lucide-react"

interface CustomContextMenuProps {
  x: number
  y: number
  onAddComment: () => void
  onSuggestEdit: () => void
}

export default function CustomContextMenu({ x, y, onAddComment, onSuggestEdit }: CustomContextMenuProps) {
  return (
    <div className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-50" style={{ top: y, left: x }}>
      <Button variant="ghost" size="sm" onClick={onAddComment} className="w-full justify-start">
        <MessageSquare className="mr-2 h-4 w-4" />
        Add Comment
      </Button>
      <Button variant="ghost" size="sm" onClick={onSuggestEdit} className="w-full justify-start">
        <Edit className="mr-2 h-4 w-4" />
        Suggest Edit
      </Button>
    </div>
  )
}

