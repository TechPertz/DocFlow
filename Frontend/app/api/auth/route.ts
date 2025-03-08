import { NextRequest, NextResponse } from 'next/server'
import { getDb, statements } from '../db'

interface User {
  id: number
  email: string
  username: string
  organization: string
  created_at: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, username, organization } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    // Check if user exists
    let user = statements.getUserByEmail(db).get(email) as User | undefined
    
    if (!user) {
      // Extract username and organization from email if not provided
      const derivedUsername = username || email.split('@')[0]
      const derivedOrganization = organization || email.split('@')[1]?.split('.')[0]

      // Create new user
      statements.createUser(db).run(email, derivedUsername, derivedOrganization)
      user = statements.getUserByEmail(db).get(email) as User
    }

    return NextResponse.json({
      email: user.email,
      username: user.username,
      organization: user.organization
    })
  } catch (error) {
    console.error('Error during authentication:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 