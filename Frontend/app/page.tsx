"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DocumentList } from "@/components/document-list"
import CreateDocumentDialog from "@/components/create-document-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useDocuments } from "@/hooks/use-documents"

export default function Home() {
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { documents } = useDocuments(activeTab)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 min-h-screen"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-100"
        >
          Document Dashboard
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Document
          </Button>
          <CreateDocumentDialog 
            isOpen={isCreateDialogOpen} 
            onClose={() => setIsCreateDialogOpen(false)} 
          />
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-full bg-indigo-100 dark:bg-indigo-900 p-1 gap-2">
          <TabsTrigger
            value="all"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Draft</span>
          </TabsTrigger>
          <TabsTrigger
            value="todo"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Todo</span>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
          >
            <Clock className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Pending</span>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Approved</span>
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
          >
            <XCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Rejected</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DocumentList documents={documents} status="all" />
        </TabsContent>
        <TabsContent value="draft">
          <DocumentList documents={documents} status="draft" />
        </TabsContent>
        <TabsContent value="todo">
          <DocumentList documents={documents} status="todo" />
        </TabsContent>
        <TabsContent value="pending">
          <DocumentList documents={documents} status="pending" />
        </TabsContent>
        <TabsContent value="approved">
          <DocumentList documents={documents} status="approved" />
        </TabsContent>
        <TabsContent value="rejected">
          <DocumentList documents={documents} status="rejected" />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

