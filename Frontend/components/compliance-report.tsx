"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Loader, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from "lucide-react"

interface ComplianceReportProps {
  document: File
  instructions: string
  isLoading: boolean
  onGenerateReport: () => Promise<any>
}

interface AnalysisResult {
  chunk_text: string
  analysis_result: string
}

interface ApiResponse {
  success: boolean
  query: string
  individual_results: AnalysisResult[]
  storage_info: {
    faiss_index_path: string
    sqlite_db_path: string
  }
}

export default function ComplianceReport({ document, instructions, isLoading, onGenerateReport }: ComplianceReportProps) {
  const [report, setReport] = useState<ApiResponse | null>(null)
  const [expandedSections, setExpandedSections] = useState<number[]>([])

  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  useEffect(() => {
    const generateReport = async () => {
      try {
        const data = await onGenerateReport()
        if (data && data.success) {
          setReport(data)
          // Initially expand all sections
          if (data.individual_results) {
            setExpandedSections([...Array(data.individual_results.length).keys()])
          }
        }
      } catch (error) {
        console.error('Error generating report:', error)
      }
    }

    if (isLoading) {
      generateReport()
    }
  }, [isLoading, onGenerateReport])

  if (isLoading || !report) {
    return (
      <Card className="rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader className="h-12 w-12 animate-spin text-indigo-600" />
              <div className="absolute inset-0 animate-pulse bg-indigo-100 dark:bg-indigo-900 rounded-full blur-xl opacity-50"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Analyzing Document</h3>
              <p className="text-muted-foreground">Please wait while we generate your compliance report...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">Compliance Report</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-indigo-600 dark:text-indigo-400">{document.name}</span>
            </div>
            <div className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <h4 className="text-lg font-semibold mb-4">Query</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{report.query}</p>
              </div>
              
              <div className="space-y-4">
                {report.individual_results.map((result, index) => (
                  <div 
                    key={index}
                    className="bg-white/50 dark:bg-gray-900/50 rounded-lg border border-indigo-100 dark:border-indigo-900"
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors rounded-t-lg"
                    >
                      <div className="flex items-center gap-2">
                        {result.analysis_result.toLowerCase().includes('issue') ? (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <h5 className="text-md font-semibold">Document Section {index + 1}</h5>
                      </div>
                      {expandedSections.includes(index) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    
                    {expandedSections.includes(index) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 pt-2"
                      >
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            {result.chunk_text}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div>
                            <h6 className="text-sm font-semibold mb-1">Analysis</h6>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                              {result.analysis_result}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

