"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Document } from "@/types/document"

type DocumentContextType = {
  documents: Document[]
  addDocument: (document: Document) => void
  updateDocument: (id: string, updatedDocument: Partial<Document>) => void
  deleteDocument: (id: string) => void
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export const useDocuments = () => {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentProvider")
  }
  return context
}

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    // Load documents from localStorage on initial render
    const storedDocuments = localStorage.getItem("documents")
    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments))
    }
  }, [])

  useEffect(() => {
    // Save documents to localStorage whenever they change
    localStorage.setItem("documents", JSON.stringify(documents))

    // Broadcast the change to other tabs
    const event = new CustomEvent("documentsUpdated", { detail: documents })
    window.dispatchEvent(event)
  }, [documents])

  useEffect(() => {
    // Listen for changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "documents") {
        setDocuments(JSON.parse(event.newValue || "[]"))
      }
    }

    const handleCustomEvent = (event: CustomEvent<Document[]>) => {
      setDocuments(event.detail)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("documentsUpdated", handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("documentsUpdated", handleCustomEvent as EventListener)
    }
  }, [])

  const addDocument = (document: Document) => {
    setDocuments((prevDocuments) => [...prevDocuments, document])
  }

  const updateDocument = (id: string, updatedDocument: Partial<Document>) => {
    setDocuments((prevDocuments) => prevDocuments.map((doc) => (doc.id === id ? { ...doc, ...updatedDocument } : doc)))
  }

  const deleteDocument = (id: string) => {
    setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== id))
  }

  return (
    <DocumentContext.Provider value={{ documents, addDocument, updateDocument, deleteDocument }}>
      {children}
    </DocumentContext.Provider>
  )
}

