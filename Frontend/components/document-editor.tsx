"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  ImageIcon,
  MessageSquare,
  History,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import type { Comment, Suggestion, Version } from "@/types/document"
import CommentBubble from "@/components/comment-bubble"
import SuggestionBubble from "@/components/suggestion-bubble"
import CustomContextMenu from "@/components/custom-context-menu"
import VersionHistory from "@/components/version-history"

interface DocumentEditorProps {
  content: string
  comments: Comment[]
  suggestions: Suggestion[]
  versions: Version[]
}

export default function DocumentEditor({
  content: initialContent,
  comments: initialComments,
  suggestions: initialSuggestions,
  versions: initialVersions,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [comments, setComments] = useState(initialComments || [])
  const [suggestions, setSuggestions] = useState(initialSuggestions || [])
  const [versions, setVersions] = useState(initialVersions || [])
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleSave = useCallback(() => {
    const newVersion: Version = {
      id: `v${versions.length + 1}`,
      content,
      author: {
        id: "current-user",
        name: "You",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      createdAt: new Date().toISOString(),
    }
    setVersions([...versions, newVersion])
    toast({
      title: "Document saved",
      description: "Your changes have been saved successfully.",
    })
  }, [content, versions, toast])

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleAddComment = () => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const commentId = `comment-${Date.now()}`
      const span = document.createElement("span")
      span.className = "comment-highlight"
      span.dataset.commentId = commentId
      range.surroundContents(span)

      const newComment: Comment = {
        id: commentId,
        content: "New comment",
        author: {
          id: "current-user",
          name: "You",
          avatarUrl: "/placeholder.svg?height=40&width=40",
        },
        createdAt: new Date().toISOString(),
      }

      setComments([...comments, newComment])
    } else {
      toast({
        title: "No text selected",
        description: "Please select some text to add a comment.",
        variant: "destructive",
      })
    }
  }

  const handleSuggestEdit = () => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const suggestionId = `suggestion-${Date.now()}`
      const span = document.createElement("span")
      span.className = "suggestion-highlight"
      span.dataset.suggestionId = suggestionId
      range.surroundContents(span)

      const newSuggestion: Suggestion = {
        id: suggestionId,
        content: "Suggested edit",
        author: {
          id: "current-user",
          name: "You",
          avatarUrl: "/placeholder.svg?height=40&width=40",
        },
        createdAt: new Date().toISOString(),
      }

      setSuggestions([...suggestions, newSuggestion])
    } else {
      toast({
        title: "No text selected",
        description: "Please select some text to suggest an edit.",
        variant: "destructive",
      })
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenuPosition(null)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleSave])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4"
    >
      <Card className="top-0 z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-2">
          <Toggle aria-label="Bold" className="rounded-full" onPressedChange={() => handleFormat("bold")}>
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Italic" className="rounded-full" onPressedChange={() => handleFormat("italic")}>
            <Italic className="h-4 w-4" />
          </Toggle>
          <div className="mx-1 h-6 w-px bg-indigo-200 dark:bg-indigo-700"></div>
          <Toggle
            aria-label="Heading 1"
            className="rounded-full"
            onPressedChange={() => handleFormat("formatBlock", "<h1>")}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="Heading 2"
            className="rounded-full"
            onPressedChange={() => handleFormat("formatBlock", "<h2>")}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="Heading 3"
            className="rounded-full"
            onPressedChange={() => handleFormat("formatBlock", "<h3>")}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
          <div className="mx-1 h-6 w-px bg-indigo-200 dark:bg-indigo-700"></div>
          <Toggle
            aria-label="Bullet List"
            className="rounded-full"
            onPressedChange={() => handleFormat("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="Numbered List"
            className="rounded-full"
            onPressedChange={() => handleFormat("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <div className="mx-1 h-6 w-px bg-indigo-200 dark:bg-indigo-700"></div>
          <Toggle
            aria-label="Insert Image"
            className="rounded-full"
            onPressedChange={() => handleFormat("insertImage", prompt("Enter image URL") || "")}
          >
            <ImageIcon className="h-4 w-4" />
          </Toggle>
          <div className="mx-1 h-6 w-px bg-indigo-200 dark:bg-indigo-700"></div>
          <Button variant="outline" size="sm" onClick={handleAddComment} className="rounded-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
          <Button variant="outline" size="sm" onClick={handleSuggestEdit} className="rounded-full">
            Suggest Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowVersionHistory(true)} className="rounded-full">
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
          <div className="flex-1"></div>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Save
          </Button>
        </div>
      </Card>

      <div className="flex">
        <Card className="flex-grow min-h-[600px] p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg relative">
          <div
            ref={editorRef}
            className="prose prose-indigo dark:prose-invert max-w-none min-h-[500px]"
            contentEditable
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            onContextMenu={handleContextMenu}
          />
          {contextMenuPosition && (
            <CustomContextMenu
              x={contextMenuPosition.x}
              y={contextMenuPosition.y}
              onAddComment={handleAddComment}
              onSuggestEdit={handleSuggestEdit}
            />
          )}
        </Card>
        <div className="w-64 ml-4">
          {comments.map((comment) => (
            <CommentBubble key={comment.id} comment={comment} />
          ))}
          {suggestions.map((suggestion) => (
            <SuggestionBubble key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      </div>

      {showVersionHistory && (
        <VersionHistory
          versions={versions}
          onClose={() => setShowVersionHistory(false)}
          onRevert={(version) => {
            setContent(version.content)
            setShowVersionHistory(false)
          }}
        />
      )}
    </motion.div>
  )
}

