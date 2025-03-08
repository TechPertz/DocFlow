export interface WorkflowStep {
  role: string
  description: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  active: boolean
  teamId: string
  team: string
  createdBy: {
    id: string
    name: string
    avatarUrl?: string
  }
  createdAt: string
  steps: WorkflowStep[]
}

