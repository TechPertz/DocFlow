export interface User {
  id: string
  name: string
  avatarUrl?: string
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
}

export interface Suggestion {
  id: string
  content: string
  author: User
  createdAt: string
}

export interface Version {
  id: string
  content: string
  author: User
  createdAt: string
}

export interface Document {
  id: string
  title: string
  excerpt: string
  content: string
  status: "draft" | "todo" | "pending" | "approved" | "rejected"
  type: string
  organization: string
  author: User
  createdAt: string
  updatedAt: string
  comments: Comment[]
  suggestions?: Suggestion[]
  versions?: Version[]
}

