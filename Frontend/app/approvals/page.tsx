"use client"

import { useState, useEffect } from "react"
import { useDocuments } from "@/hooks/use-documents"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ApprovalList from "@/components/approval-list"
import TodoApprovalItem from "@/components/todo-approval-item"
import { motion } from "framer-motion"
import { FileCheck, ListTodo } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import CreateApprovalDialog from "@/components/create-approval-dialog"
import type { Document } from "@/types/document"

export default function ApprovalsPage() {
  const [status, setStatus] = useState<"todo" | "pending" | "approved" | "rejected">("todo")
  const { documents: initialDocuments, organization } = useDocuments()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const { toast } = useToast()
  const [isCreateApprovalOpen, setIsCreateApprovalOpen] = useState(false)

  // Update documents when initialDocuments changes
  useEffect(() => {
    setDocuments(initialDocuments)
  }, [initialDocuments])

  const filteredDocuments = documents.filter((doc) => doc.status === status)

  const handleApprove = async (id: string, rating: number, feedback: string) => {
    try {
      const sessionUser = sessionStorage.getItem("user")
      if (!sessionUser) {
        throw new Error('User not found in session')
      }
      const { email } = JSON.parse(sessionUser)

      const response = await fetch(`/api/documents/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback,
          email,
          organization
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve document')
      }

      const updatedDoc = await response.json()
      
      // Update documents state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === id ? updatedDoc : doc
        )
      )

      toast({
        title: "Document approved",
        description: `Document has been approved with ${rating} stars${feedback ? ` and feedback: "${feedback}"` : ""}.`,
      })

      // Auto-switch to approved tab
      setStatus("approved")
    } catch (error) {
      console.error('Error approving document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve document. Please try again.",
      })
    }
  }

  const handleReject = async (id: string, feedback: string) => {
    try {
      const sessionUser = sessionStorage.getItem("user")
      if (!sessionUser) {
        throw new Error('User not found in session')
      }
      const { email } = JSON.parse(sessionUser)

      const response = await fetch(`/api/documents/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          email,
          organization
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject document')
      }

      const updatedDoc = await response.json()
      
      // Update documents state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === id ? updatedDoc : doc
        )
      )

      toast({
        variant: "destructive",
        title: "Document rejected",
        description: `Document has been rejected with feedback: "${feedback}"`,
      })

      // Auto-switch to rejected tab
      setStatus("rejected")
    } catch (error) {
      console.error('Error rejecting document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject document. Please try again.",
      })
    }
  }

  if (!organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Please log in to view documents</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl overflow-hidden">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2">
                <FileCheck className="h-8 w-8" />
                <h2 className="text-3xl font-bold">Document Approvals</h2>
              </div>
              <p className="text-indigo-100">Review and manage document approval statuses for {organization}</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setIsCreateApprovalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              Create Approval
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <CreateApprovalDialog
        isOpen={isCreateApprovalOpen}
        onClose={() => setIsCreateApprovalOpen(false)}
      />

      <Tabs value={status} onValueChange={(value) => setStatus(value as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4 rounded-full bg-indigo-100 dark:bg-indigo-900 p-1 gap-2">
          <TabsTrigger value="todo" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800">
            <ListTodo className="mr-2 h-4 w-4" />
            TO-DO
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800">
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todo" className="mt-6">
          <motion.div
            key="todo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4"
          >
            {filteredDocuments.map((document) => (
              <TodoApprovalItem
                key={document.id}
                document={document}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
            {filteredDocuments.length === 0 && (
              <Card>
                <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                  <p className="text-center text-muted-foreground">No documents to review</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ApprovalList documents={filteredDocuments} status="pending" />
          </motion.div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <motion.div
            key="approved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ApprovalList documents={filteredDocuments} status="approved" />
          </motion.div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <motion.div
            key="rejected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ApprovalList documents={filteredDocuments} status="rejected" />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

