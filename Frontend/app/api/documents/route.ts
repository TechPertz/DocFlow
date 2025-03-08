import { NextRequest, NextResponse } from 'next/server'
import { getDb, statements } from '../db'
import { randomUUID } from 'crypto'

interface DBDocument {
  id: string
  title: string
  excerpt: string | null
  content: string | null
  status: "draft" | "todo" | "pending" | "approved" | "rejected"
  type: string | null
  organization: string
  author_id: number
  author_name: string
  author_email: string
  created_at: string
  updated_at: string
}

interface DBUser {
  id: number
  email: string
  username: string
  organization: string
}

interface DBApproval {
  id: string
  document_id: string
  assigned_to: number
  status: "pending" | "approved" | "rejected"
  rating: number | null
  feedback: string | null
  created_at: string
  updated_at: string
  approver_email: string
  approver_name: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organization = searchParams.get('organization')
    const userEmail = searchParams.get('email')

    if (!organization || !userEmail) {
      return NextResponse.json(
        { error: 'Organization and email are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    // Get current user's ID
    const currentUser = statements.getUserByEmail(db).get(userEmail) as DBUser | undefined
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const documents = statements.getDocumentsByOrg(db).all(organization) as DBDocument[]

    // Get approvals for all documents
    const formattedDocs = await Promise.all(documents.map(async doc => {
      // Get approval for this document
      const approval = db.prepare(`
        SELECT a.*, u.email as approver_email, u.username as approver_name
        FROM approvals a
        LEFT JOIN users u ON a.assigned_to = u.id
        WHERE a.document_id = ?
      `).get(doc.id) as DBApproval | undefined

      // Determine document status based on approval
      let status = doc.status
      if (approval) {
        if (approval.assigned_to === currentUser.id) {
          // If assigned to current user, show as "todo"
          status = approval.status === 'pending' ? 'todo' : approval.status
        } else {
          // If assigned to someone else, show as "pending"
          status = approval.status === 'pending' ? 'pending' : approval.status
        }
      }

      return {
        id: doc.id,
        title: doc.title,
        excerpt: doc.excerpt || "",
        content: doc.content || "",
        status,
        type: doc.type || "",
        organization: doc.organization,
        author: {
          id: doc.author_id.toString(),
          name: doc.author_name,
          avatarUrl: "/placeholder.svg?height=40&width=40"
        },
        assignedTo: approval ? {
          id: approval.assigned_to.toString(),
          name: approval.approver_name,
          email: approval.approver_email
        } : undefined,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        comments: []
      }
    }))

    return NextResponse.json(formattedDocs)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, organization, ...updates } = await request.json()

    if (!id || !organization) {
      return NextResponse.json(
        { error: 'Document ID and organization are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    statements.updateDocument(db).run(
      updates.title,
      updates.excerpt,
      updates.content,
      updates.status,
      updates.type,
      id,
      organization
    )

    // Get updated document
    const doc = statements.getDocumentById(db).get(id, organization) as DBDocument

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      excerpt: doc.excerpt || "",
      content: doc.content || "",
      status: doc.status,
      type: doc.type || "",
      organization: doc.organization,
      author: {
        id: doc.author_id.toString(),
        name: doc.author_name,
        avatarUrl: "/placeholder.svg?height=40&width=40"
      },
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      comments: []
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, excerpt, content, type, email, organization } = await request.json()

    if (!title || !organization || !email) {
      return NextResponse.json(
        { error: 'Title, organization, and user email are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    // Get user ID from email
    const user = statements.getUserByEmail(db).get(email) as DBUser | undefined
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify user belongs to the organization
    if (user.organization !== organization) {
      return NextResponse.json(
        { error: 'User does not belong to this organization' },
        { status: 403 }
      )
    }

    // Create new document
    const docId = randomUUID()
    statements.createDocument(db).run(
      docId,
      title,
      excerpt || null,
      content || null,
      'draft', // Initial status
      type || null,
      organization,
      user.id
    )

    // Get the created document
    const doc = statements.getDocumentById(db).get(docId, organization) as DBDocument

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      excerpt: doc.excerpt || "",
      content: doc.content || "",
      status: doc.status,
      type: doc.type || "",
      organization: doc.organization,
      author: {
        id: doc.author_id.toString(),
        name: doc.author_name,
        avatarUrl: "/placeholder.svg?height=40&width=40"
      },
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      comments: []
    })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 