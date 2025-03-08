import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'docflow.db'))
  }
  return db
}

// Prepare statements for common operations
export const statements = {
  // User operations
  getUserByEmail: (db: Database.Database) => 
    db.prepare('SELECT * FROM users WHERE email = ?'),
  
  createUser: (db: Database.Database) => 
    db.prepare('INSERT INTO users (email, username, organization) VALUES (?, ?, ?)'),

  // Document operations
  createDocument: (db: Database.Database) =>
    db.prepare(`
      INSERT INTO documents (id, title, excerpt, content, status, type, organization, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `),

  getDocumentsByOrg: (db: Database.Database) => 
    db.prepare(`
      SELECT d.*, u.username as author_name, u.email as author_email
      FROM documents d
      LEFT JOIN users u ON d.author_id = u.id
      WHERE d.organization = ?
    `),

  getDocumentById: (db: Database.Database) => 
    db.prepare(`
      SELECT d.*, u.username as author_name, u.email as author_email
      FROM documents d
      LEFT JOIN users u ON d.author_id = u.id
      WHERE d.id = ? AND d.organization = ?
    `),

  updateDocument: (db: Database.Database) => 
    db.prepare(`
      UPDATE documents 
      SET title = COALESCE(?, title),
          excerpt = COALESCE(?, excerpt),
          content = COALESCE(?, content),
          status = COALESCE(?, status),
          type = COALESCE(?, type),
          updated_at = DATETIME('now')
      WHERE id = ? AND organization = ?
    `),

  // Comment operations
  getCommentsByDocument: (db: Database.Database) => 
    db.prepare(`
      SELECT c.*, u.username as author_name, u.email as author_email
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.document_id = ?
    `),

  addComment: (db: Database.Database) => 
    db.prepare('INSERT INTO comments (id, document_id, content, author_id) VALUES (?, ?, ?, ?)'),

  // Delete operations
  deleteDocument: (db: Database.Database) =>
    db.prepare('DELETE FROM documents WHERE id = ? AND organization = ?'),

  deleteCommentsByDocument: (db: Database.Database) =>
    db.prepare('DELETE FROM comments WHERE document_id = ?'),

  // Approval operations
  getApprovalByDocumentId: (db: Database.Database) =>
    db.prepare(`
      SELECT a.*, u.email as approver_email, u.username as approver_name
      FROM approvals a
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE a.document_id = ?
    `),

  createApproval: (db: Database.Database) =>
    db.prepare(`
      INSERT INTO approvals (id, document_id, assigned_to, status, rating, feedback)
      VALUES (?, ?, ?, ?, ?, ?)
    `),

  updateApproval: (db: Database.Database) =>
    db.prepare(`
      UPDATE approvals
      SET status = ?,
          rating = ?,
          feedback = ?,
          updated_at = DATETIME('now')
      WHERE document_id = ? AND assigned_to = ?
    `)
} 