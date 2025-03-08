import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = path.join(__dirname, '..', 'docflow.db')

interface TableInfo {
  name: string;
}

interface UserCount {
  count: number;
}

interface UserId {
  id: number;
}

interface ColumnInfo {
  name: string;
}

function setupDatabase() {
  console.log('Setting up database...')
  
  try {
    // Create/connect to database
    const db = new Database(dbPath, { verbose: console.log })
    
    // Check if tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('users', 'documents', 'comments', 'approvals')
    `).all() as TableInfo[]
    
    const existingTables = new Set(tables.map(t => t.name))
    console.log('Existing tables:', Array.from(existingTables))

    // Create tables if they don't exist
    if (!existingTables.has('users')) {
      console.log('Creating users table...')
      db.prepare(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          organization TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run()
    }

    if (!existingTables.has('documents')) {
      console.log('Creating documents table...')
      db.prepare(`
        CREATE TABLE documents (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          excerpt TEXT,
          content TEXT,
          status TEXT NOT NULL,
          type TEXT,
          organization TEXT NOT NULL,
          author_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id)
        )
      `).run()
    } else {
      // Check if we need to add any new columns to documents
      const documentColumns = db.prepare(`PRAGMA table_info(documents)`).all() as ColumnInfo[]
      const existingColumns = new Set(documentColumns.map(c => c.name))
      
      if (!existingColumns.has('assigned_to')) {
        console.log('Adding assigned_to column to documents table...')
        db.prepare(`ALTER TABLE documents ADD COLUMN assigned_to INTEGER REFERENCES users(id)`).run()
      }
    }

    if (!existingTables.has('comments')) {
      console.log('Creating comments table...')
      db.prepare(`
        CREATE TABLE comments (
          id TEXT PRIMARY KEY,
          document_id TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (document_id) REFERENCES documents(id),
          FOREIGN KEY (author_id) REFERENCES users(id)
        )
      `).run()
    }

    if (!existingTables.has('approvals')) {
      console.log('Creating approvals table...')
      db.prepare(`
        CREATE TABLE approvals (
          id TEXT PRIMARY KEY,
          document_id TEXT NOT NULL,
          assigned_to INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          rating INTEGER,
          feedback TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (document_id) REFERENCES documents(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
      `).run()
    }

    // Check if we need to add sample data
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as UserCount
    if (userCount.count === 0) {
      console.log('Adding sample data...')
      
      // Sample users
      const users = [
        { email: 'user1@gmail.com', username: 'user1', organization: 'gmail' },
        { email: 'user2@gmail.com', username: 'user2', organization: 'gmail' },
        { email: 'user1@yahoo.com', username: 'user1', organization: 'yahoo' },
        { email: 'user2@yahoo.com', username: 'user2', organization: 'yahoo' }
      ]

      // Insert users and collect their IDs
      const userIds = users.map(user => {
        db.prepare('INSERT INTO users (email, username, organization) VALUES (?, ?, ?)')
          .run(user.email, user.username, user.organization)
        return (db.prepare('SELECT id FROM users WHERE email = ?').get(user.email) as UserId).id
      })

      // Sample documents
      const documents = [
        {
          id: '1',
          title: 'Q4 Marketing Strategy',
          excerpt: 'A comprehensive plan for Q4 marketing activities and campaigns',
          content: '# Q4 Marketing Strategy\n\nThis document outlines our marketing approach for Q4 2023...',
          status: 'approved',
          type: 'Strategy',
          organization: 'gmail',
          author_id: userIds[0]
        },
        {
          id: '2',
          title: 'Product Roadmap 2024',
          excerpt: 'Detailed plan for product development and feature releases in 2024',
          content: '# Product Roadmap 2024\n\nThis document outlines our product development plan for 2024...',
          status: 'todo',
          type: 'Roadmap',
          organization: 'gmail',
          author_id: userIds[1]
        },
        {
          id: '3',
          title: 'Security Audit Results',
          excerpt: 'Results and recommendations from the Q3 security audit',
          content: '# Security Audit Results\n\nThis document presents the findings from our recent security audit...',
          status: 'approved',
          type: 'Report',
          organization: 'interface',
          author_id: userIds[2]
        },
        {
          id: '4',
          title: 'New Feature Design',
          excerpt: 'Design proposal for the new user dashboard interface',
          content: '# New Feature Design\n\nThis document outlines the design for our new dashboard...',
          status: 'todo',
          type: 'Design',
          organization: 'interface',
          author_id: userIds[3]
        }
      ]

      // Insert documents and create approvals
      for (const doc of documents) {
        // Insert document
        db.prepare(`
          INSERT INTO documents (id, title, excerpt, content, status, type, organization, author_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          doc.id,
          doc.title,
          doc.excerpt,
          doc.content,
          doc.status,
          doc.type,
          doc.organization,
          doc.author_id
        )

        // Create approval requests for todo and approved documents
        if (doc.status === 'todo' || doc.status === 'approved') {
          // Assign to a different user in the same organization
          const assignedTo = userIds.find(id => 
            id !== doc.author_id && 
            users[id - 1].organization === doc.organization
          )

          if (assignedTo) {
            db.prepare(`
              INSERT INTO approvals (id, document_id, assigned_to, status, rating, feedback)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              `a${doc.id}`,
              doc.id,
              assignedTo,
              doc.status === 'approved' ? 'approved' : 'pending',
              doc.status === 'approved' ? 5 : null,
              doc.status === 'approved' ? 'Excellent work!' : null
            )
          }
        }
      }

      // Add sample comments
      db.prepare(`
        INSERT INTO comments (id, document_id, content, author_id)
        VALUES (?, ?, ?, ?)
      `).run(
        'c1',
        '1',
        'Great work on the social media campaign section!',
        userIds[1]
      )

      db.prepare(`
        INSERT INTO comments (id, document_id, content, author_id)
        VALUES (?, ?, ?, ?)
      `).run(
        'c2',
        '3',
        'All vulnerabilities have been addressed.',
        userIds[2]
      )
    } else {
      console.log('Sample data already exists')
    }

    console.log('Database setup complete!')
    db.close()
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase() 