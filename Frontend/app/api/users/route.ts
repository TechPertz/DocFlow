import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '../db'

interface DBUser {
  id: number
  email: string
  username: string
  organization: string
  created_at: string
}

export async function GET(request: NextRequest) {
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
    
    // Get all users from the organization
    const users = db.prepare(`
      SELECT id, email, username, organization
      FROM users
      WHERE organization = ?
    `).all(organization) as DBUser[]

    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      organization: user.organization
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 