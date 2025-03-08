"use client"

import { useState, useEffect } from "react"
import type { Workflow } from "@/types/workflow"

// Mock data for workflows
const mockWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Document Approval Process",
    description: "Standard document approval workflow for the engineering team",
    active: true,
    teamId: "team1",
    team: "Engineering",
    createdBy: {
      id: "user1",
      name: "Alice Johnson",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-09-15T10:30:00Z",
    steps: [
      { role: "Junior Developer", description: "Initial draft and submission" },
      { role: "Senior Developer", description: "Technical review and feedback" },
      { role: "Team Lead", description: "Final approval" },
    ],
  },
  {
    id: "2",
    name: "Marketing Campaign Approval",
    description: "Workflow for approving marketing campaigns and materials",
    active: true,
    teamId: "team2",
    team: "Marketing",
    createdBy: {
      id: "user2",
      name: "Bob Smith",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-10-01T08:15:00Z",
    steps: [
      { role: "Designer", description: "Create initial designs" },
      { role: "Marketing Manager", description: "Review and provide feedback" },
      { role: "Director", description: "Budget approval" },
      { role: "VP", description: "Final sign-off" },
    ],
  },
  {
    id: "3",
    name: "Budget Request Process",
    description: "Workflow for budget requests and approvals",
    active: false,
    teamId: "team3",
    team: "Finance",
    createdBy: {
      id: "user3",
      name: "Charlie Davis",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-09-20T09:00:00Z",
    steps: [
      { role: "Department Head", description: "Initial budget request" },
      { role: "Finance Manager", description: "Budget review" },
      { role: "CFO", description: "Final approval" },
    ],
  },
  {
    id: "4",
    name: "Product Feature Approval",
    description: "Workflow for approving new product features",
    active: true,
    teamId: "team4",
    team: "Product",
    createdBy: {
      id: "current-user",
      name: "You",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-10-10T11:20:00Z",
    steps: [
      { role: "Product Manager", description: "Feature specification" },
      { role: "Designer", description: "UI/UX design review" },
      { role: "Senior Developer", description: "Technical feasibility assessment" },
      { role: "Team Lead", description: "Implementation approval" },
    ],
  },
  {
    id: "5",
    name: "Code Review Process",
    description: "Standard workflow for code reviews and merges",
    active: true,
    teamId: "current-team",
    team: "Engineering",
    createdBy: {
      id: "current-user",
      name: "You",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-10-08T13:30:00Z",
    steps: [
      { role: "Junior Developer", description: "Code implementation" },
      { role: "Senior Developer", description: "Code review" },
      { role: "QA Engineer", description: "Testing verification" },
      { role: "Team Lead", description: "Final approval and merge" },
    ],
  },
  {
    id: "6",
    name: "Deployment Approval",
    description: "Workflow for approving production deployments",
    active: true,
    teamId: "current-team",
    team: "DevOps",
    createdBy: {
      id: "user6",
      name: "Frank Miller",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-09-28T10:15:00Z",
    steps: [
      { role: "DevOps Engineer", description: "Deployment preparation" },
      { role: "QA Engineer", description: "Pre-deployment testing" },
      { role: "Product Manager", description: "Feature verification" },
      { role: "CTO", description: "Final deployment approval" },
    ],
  },
]

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with a delay
    const timer = setTimeout(() => {
      setWorkflows(mockWorkflows)
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return { workflows, isLoading }
}

export function useWorkflowById(id: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with a delay
    const timer = setTimeout(() => {
      const foundWorkflow = mockWorkflows.find((wf) => wf.id === id) || null
      setWorkflow(foundWorkflow)
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [id])

  return { workflow, isLoading }
}

