import { NextRequest, NextResponse } from 'next/server'
import { getDb, statements } from '../../db'

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

interface DBComment {
  id: string
  document_id: string
  content: string
  author_id: number
  author_name: string
  author_email: string
  created_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const organization = searchParams.get('organization')

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization is required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const doc = statements.getDocumentById(db).get(params.id, organization) as DBDocument | undefined

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get comments for this document
    const comments = statements.getCommentsByDocument(db).all(params.id) as DBComment[]

    // Convert to application Document format
    const formattedDoc = {
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
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.author_id.toString(),
          name: comment.author_name,
          avatarUrl: "/placeholder.svg?height=40&width=40"
        },
        createdAt: comment.created_at
      }))
    }

    return NextResponse.json(formattedDoc)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { organization, email } = await request.json();

    if (!organization || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    const db = getDb();
    const document = statements.getDocumentById(db).get(params.id, organization);

    if (!document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
      });
    }

    // Delete associated comments first
    statements.deleteCommentsByDocument(db).run(params.id);

    // Delete the document
    statements.deleteDocument(db).run(params.id, organization);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
} 