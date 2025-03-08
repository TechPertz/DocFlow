"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, ArrowRight, Upload } from "lucide-react"
import ComplianceReport from "@/components/compliance-report"
import { useToast } from "@/components/ui/use-toast"

export default function CompliancePage() {
  const [document, setDocument] = useState<File | null>(null)
  const [instructions, setInstructions] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Check if file is a document
      if (!file.type.includes('document') && !file.type.includes('pdf')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a document file (PDF, DOC, DOCX)",
          variant: "destructive"
        })
        return
      }
      setDocument(file)
    }
  }

  const handleGenerateReport = async () => {
    if (!document || !instructions) return

    setIsLoading(true)
    setShowReport(true)

    try {
      const formData = new FormData()
      formData.append('file', document)
      formData.append('query', instructions)
      formData.append('top_k', '5')

      const response = await fetch('http://localhost:8000/api/audit/search', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      return data

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate compliance report. Please try again.",
        variant: "destructive"
      })
      setShowReport(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-[2rem] overflow-hidden border-none shadow-xl">
          <CardContent className="p-10">
            <h2 className="text-4xl font-bold mb-3 bg-clip-text">Compliance Check</h2>
            <p className="text-indigo-100 text-lg">Upload a document and let AI analyze its compliance</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold">Upload Document</h3>
              </div>
              <div className="space-y-4">
                <Input 
                  type="file" 
                  onChange={handleFileUpload} 
                  accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg p-8 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" 
                />
                {document && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                    <FileText className="h-4 w-4" />
                    {document.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold">Instructions</h3>
              </div>
              <Textarea
                placeholder="Enter your instructions or queries about the document..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[120px] resize-none border-2 focus:border-indigo-300 dark:focus:border-indigo-700"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleGenerateReport}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            disabled={!document || !instructions || isLoading}
          >
            {isLoading ? "Generating..." : "Generate Report"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {showReport ? (
            <div>
              <ComplianceReport 
                document={document!} 
                instructions={instructions} 
                isLoading={isLoading}
                onGenerateReport={handleGenerateReport}
              />
            </div>
          ) : (
            <Card className="flex items-center justify-center p-10 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-indigo-100 dark:border-indigo-900">
              <div className="text-center space-y-4">
                <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900 inline-block">
                  <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-muted-foreground text-lg max-w-sm">
                  Upload a document and provide instructions to generate a compliance report
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

