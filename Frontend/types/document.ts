export interface Document {
  id: string
  title: string
  excerpt?: string
  content?: string
  status: "draft" | "todo" | "pending" | "approved" | "rejected"
  type?: string
  organization: string
  author?: {
    id: string
    name: string
    avatarUrl?: string
  }
  assignedTo?: string
  comments?: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
      avatarUrl?: string
    }
    createdAt: string
  }>
  suggestions?: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
      avatarUrl?: string
    }
    createdAt: string
  }>
  versions?: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
      avatarUrl?: string
    }
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
} 