"use client"

import { useState, useEffect } from "react"
import type { Document } from "@/types/document"

// Create a single broadcast channel instance
const documentChannel = typeof window !== 'undefined' ? new BroadcastChannel('document-updates') : null

// Function to get organization from storage
const getOrganizationFromStorage = () => {
  if (typeof window === 'undefined') return null
  
  // First check session storage
  const sessionUser = window.sessionStorage.getItem('user')
  if (sessionUser) {
    try {
      const userData = JSON.parse(sessionUser)
      return userData.organization
    } catch (error) {
      console.error('Error parsing session storage user data:', error)
    }
  }
  
  // Fall back to cookie
  const userCookie = window.document.cookie
    .split('; ')
    .find((row: string) => row.startsWith('user='))
    ?.split('=')[1]

  if (userCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie))
      return userData.organization
    } catch (error) {
      console.error('Error parsing user cookie:', error)
    }
  }
  
  return null
}

// Function to broadcast updates
const broadcastUpdate = (type: string, data: any) => {
  if (documentChannel) {
    documentChannel.postMessage({ type, data })
  }
}

export function useDocuments(status: string = 'all') {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [organization, setOrganization] = useState<string>("")

  // Initial load of documents and organization
  useEffect(() => {
    let mounted = true
    
    const loadDocuments = async () => {
      const org = getOrganizationFromStorage()
      const sessionUser = sessionStorage.getItem('user')
      if (org && sessionUser && mounted) {
        const { email } = JSON.parse(sessionUser)
        setOrganization(org)
        try {
          const response = await fetch(`/api/documents?organization=${org}&email=${email}`)
          if (!response.ok) {
            throw new Error('Failed to fetch documents')
          }
          const docs = await response.json() as Document[]
          if (mounted) {
            setDocuments(docs)
            setFilteredDocuments(status === 'all' ? docs : docs.filter((doc: Document) => doc.status === status))
          }
        } catch (error) {
          console.error('Error fetching documents:', error)
        }
      }
    }

    loadDocuments()

    return () => {
      mounted = false
    }
  }, [status])

  // Listen for broadcast channel updates
  useEffect(() => {
    if (!organization || !documentChannel) return

    const handleUpdate = async (event: MessageEvent) => {
      const { type, data } = event.data
      if (type === 'UPDATE' && data.organization === organization) {
        // Immediately update the specific document if it's an update
        if (data.documentId && data.document) {
          setDocuments(prevDocs => {
            const newDocs = prevDocs.map(doc => 
              doc.id === data.documentId ? data.document : doc
            )
            // Update filtered documents based on current status
            if (status === 'all') {
              setFilteredDocuments(newDocs)
            } else {
              setFilteredDocuments(newDocs.filter(doc => doc.status === status))
            }
            return newDocs
          })
        } else if (data.newDocument) {
          // Add new document immediately if it's a creation
          setDocuments(prevDocs => {
            // Prevent duplicates
            if (prevDocs.some(doc => doc.id === data.newDocument.id)) {
              return prevDocs
            }
            const newDocs = [...prevDocs, data.newDocument]
            // Update filtered documents based on current status
            if (status === 'all' || status === data.newDocument.status) {
              setFilteredDocuments(prevFiltered => {
                // Prevent duplicates in filtered view
                if (prevFiltered.some(doc => doc.id === data.newDocument.id)) {
                  return prevFiltered
                }
                return [...prevFiltered, data.newDocument]
              })
            }
            return newDocs
          })
        } else if (!data.documentId && !data.newDocument) {
          // Only fetch all documents if we don't have specific document updates
          await fetchDocuments(organization)
        }
      }
    }

    documentChannel.addEventListener('message', handleUpdate)

    return () => {
      documentChannel.removeEventListener('message', handleUpdate)
    }
  }, [organization, status])

  const fetchDocuments = async (org: string) => {
    try {
      const response = await fetch(`/api/documents?organization=${org}`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const docs = await response.json()
      setDocuments(docs)
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const createDocument = async (data: { 
    title: string
    excerpt?: string
    content?: string
    type?: string 
  }) => {
    try {
      const sessionUser = sessionStorage.getItem("user")
      if (!sessionUser) {
        throw new Error('User not found in session')
      }
      const { email } = JSON.parse(sessionUser)

      // Generate excerpt from content if not provided
      const excerpt = data.excerpt || (data.content ? data.content.slice(0, 150).trim() + (data.content.length > 150 ? '...' : '') : '')

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          excerpt,
          email,
          organization
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create document')
      }

      const newDocument = await response.json()

      // Update documents state
      setDocuments(prevDocs => {
        // Prevent duplicates
        if (prevDocs.some(doc => doc.id === newDocument.id)) {
          return prevDocs
        }
        return [...prevDocs, newDocument]
      })

      // Explicitly update filtered documents based on current status
      setFilteredDocuments(prevFiltered => {
        // If we're showing all documents or the new document matches the current status
        if (status === 'all' || newDocument.status === status) {
          // Prevent duplicates
          if (prevFiltered.some(doc => doc.id === newDocument.id)) {
            return prevFiltered
          }
          return [...prevFiltered, newDocument]
        }
        // If the document doesn't match the current filter, don't add it
        return prevFiltered
      })

      // Broadcast to other tabs
      broadcastUpdate('UPDATE', {
        organization,
        newDocument,
        timestamp: new Date().toISOString()
      })

      return newDocument
    } catch (error) {
      console.error('Error creating document:', error)
      throw error
    }
  }

  const updateDocument = async (updatedDoc: Partial<Document> & { id: string }) => {
    try {
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedDoc,
          organization
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update document')
      }

      const updatedDocument = await response.json()

      // Update documents state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === updatedDocument.id ? updatedDocument : doc
        )
      )

      // Explicitly update filtered documents based on current status
      setFilteredDocuments(prevFiltered => {
        // If showing all documents, update the document in place
        if (status === 'all') {
          return prevFiltered.map(doc => 
            doc.id === updatedDocument.id ? updatedDocument : doc
          )
        }
        
        // If the document's new status matches the current filter
        if (updatedDocument.status === status) {
          // If the document was already in the filtered list, update it
          if (prevFiltered.some(doc => doc.id === updatedDocument.id)) {
            return prevFiltered.map(doc => 
              doc.id === updatedDocument.id ? updatedDocument : doc
            )
          }
          // If it wasn't in the list but now matches the filter, add it
          return [...prevFiltered, updatedDocument]
        }
        
        // If the document's new status doesn't match the filter, remove it
        return prevFiltered.filter(doc => doc.id !== updatedDocument.id)
      })

      // Broadcast to other tabs
      broadcastUpdate('UPDATE', {
        organization,
        documentId: updatedDocument.id,
        document: updatedDocument,
        timestamp: new Date().toISOString()
      })

      return updatedDocument
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const sessionUser = sessionStorage.getItem("user")
      if (!sessionUser) {
        throw new Error('User not found in session')
      }
      const { email } = JSON.parse(sessionUser)

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          organization,
          email 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete document')
      }

      // Update documents state by removing the deleted document
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId))

      // Update filtered documents
      setFilteredDocuments(prevFiltered => prevFiltered.filter(doc => doc.id !== documentId))

      // Broadcast to other tabs
      broadcastUpdate('UPDATE', {
        organization,
        documentId,
        type: 'DELETE',
        timestamp: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  return {
    documents: filteredDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    organization
  }
}

export function useDocumentById(id: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [organization, setOrganization] = useState<string>("")

  useEffect(() => {
    const org = getOrganizationFromStorage()
    if (org) {
      setOrganization(org)
      fetchDocument(id, org)
    }
  }, [id])

  // Listen for broadcast channel updates
  useEffect(() => {
    if (!organization || !id || !documentChannel) return

    const handleUpdate = (event: MessageEvent) => {
      const { type, data } = event.data
      if (type === 'UPDATE' && data.organization === organization) {
        fetchDocument(id, organization)
      }
    }

    documentChannel.addEventListener('message', handleUpdate)

    return () => {
      documentChannel.removeEventListener('message', handleUpdate)
    }
  }, [id, organization])

  const fetchDocument = async (docId: string, org: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}?organization=${org}`)
      if (!response.ok) {
        if (response.status === 404) {
          setDocument(null)
        } else {
          throw new Error('Failed to fetch document')
        }
      } else {
        const doc = await response.json()
        setDocument(doc)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching document:', error)
      setIsLoading(false)
    }
  }

  return { document, isLoading, organization }
}

