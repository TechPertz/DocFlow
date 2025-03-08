"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useDocuments } from "@/hooks/use-documents"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteButtonProps {
  documentId: string
  className?: string
}

export function DeleteButton({ documentId, className = '' }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteDocument } = useDocuments()
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent the Link navigation
    e.stopPropagation() // Prevent event bubbling
    try {
      setIsDeleting(true)
      await deleteDocument(documentId)
      router.push('/') // Navigate back to home page after successful deletion
    } catch (error) {
      console.error('Error deleting document:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          className={`${className} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20`}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the document.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-gray-200 dark:border-gray-700">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 