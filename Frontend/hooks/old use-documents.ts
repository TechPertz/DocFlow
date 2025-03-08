"use client"

import { useState, useEffect } from "react"
import db from "@/lib/db"

export interface Document {
  id: string
  title: string
  content: string
  status: "draft" | "pending" | "approved" | "rejected"
  type: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = () => {
      const stmt = db.prepare("SELECT * FROM documents ORDER BY updatedAt DESC")
      const docs = stmt.all() as Document[]
      setDocuments(docs)
      setIsLoading(false)
    }

    fetchDocuments()
  }, [])

  const createDocument = (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const stmt = db.prepare(`
      INSERT INTO documents (title, content, status, type, authorId)
      VALUES (@title, @content, @status, @type, @authorId)
    `)
    const info = stmt.run(document)
    const newDocument = {
      ...document,
      id: info.lastInsertRowid as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setDocuments((prev) => [newDocument, ...prev])
    return newDocument
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
    const stmt = db.prepare(`
      UPDATE documents
      SET title = @title, content = @content, status = @status, type = @type, updatedAt = CURRENT_TIMESTAMP
      WHERE id = @id
    `)
    stmt.run({ ...updates, id })
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)))
  }

  return { documents, isLoading, createDocument, updateDocument }
}

export function useDocumentById(id: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDocument = () => {
      const stmt = db.prepare("SELECT * FROM documents WHERE id = ?")
      const doc = stmt.get(id) as Document | undefined
      setDocument(doc || null)
      setIsLoading(false)
    }

    fetchDocument()
  }, [id])

  return { document, isLoading }
}

