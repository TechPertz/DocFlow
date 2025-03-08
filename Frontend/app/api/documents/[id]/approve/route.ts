import { NextRequest, NextResponse } from 'next/server'
import { getDb, statements } from '../../../db'

interface DBUser {
  id: number
  email: string
  username: string
  organization: string
}

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rating, feedback, email, organization } = await request.json()

    if (!organization || !email) {
      return NextResponse.json(
        { error: 'Organization and email are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    // Get current user's ID
    const currentUser = statements.getUserByEmail(db).get(email) as DBUser | undefined
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Update the approval status
      statements.updateApproval(db).run(
        'approved',
        rating || null,
        feedback || null,
        params.id,
        currentUser.id
      )

      // Update the document status
      statements.updateDocument(db).run(
        null, // title
        null, // excerpt
        null, // content
        'approved', // status
        null, // type
        params.id,
        organization
      )
    })

    // Execute the transaction
    transaction()

    // Get the updated document
    const doc = statements.getDocumentById(db).get(params.id, organization) as DBDocument | undefined
    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found after update' },
        { status: 404 }
      )
    }

    // Get the updated approval
    const approval = statements.getApprovalByDocumentId(db).get(params.id) as DBApproval | undefined

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      excerpt: doc.excerpt || "",
      content: doc.content || "",
      status: 'approved',
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
    })
  } catch (error) {
    console.error('Error approving document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 