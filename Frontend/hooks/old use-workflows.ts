"use client"

import { useState, useEffect } from "react"
import db from "@/lib/db"

export interface Workflow {
  id: number
  name: string
  description: string
  active: boolean
  teamId: number
  createdById: number
  createdAt: string
  steps: WorkflowStep[]
}

export interface WorkflowStep {
  id: number
  workflowId: number
  role: string
  description: string
  orderIndex: number
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkflows = () => {
      const stmt = db.prepare(`
        SELECT w.*, 
               json_group_array(json_object('id', ws.id, 'workflowId', ws.workflowId, 'role', ws.role, 'description', ws.description, 'orderIndex', ws.orderIndex)) as steps
        FROM workflows w
        LEFT JOIN workflow_steps ws ON w.id = ws.workflowId
        GROUP BY w.id
        ORDER BY w.createdAt DESC
      `)
      const workflowsData = stmt.all() as (Workflow & { steps: string })[]
      const parsedWorkflows = workflowsData.map((w) => ({
        ...w,
        steps: JSON.parse(w.steps) as WorkflowStep[],
      }))
      setWorkflows(parsedWorkflows)
      setIsLoading(false)
    }

    fetchWorkflows()
  }, [])

  const createWorkflow = (workflow: Omit<Workflow, "id" | "createdAt">) => {
    const stmt = db.prepare(`
      INSERT INTO workflows (name, description, active, teamId, createdById)
      VALUES (@name, @description, @active, @teamId, @createdById)
    `)
    const info = stmt.run(workflow)
    const workflowId = info.lastInsertRowid as number

    const stepsStmt = db.prepare(`
      INSERT INTO workflow_steps (workflowId, role, description, orderIndex)
      VALUES (@workflowId, @role, @description, @orderIndex)
    `)

    workflow.steps.forEach((step, index) => {
      stepsStmt.run({
        workflowId,
        role: step.role,
        description: step.description,
        orderIndex: index,
      })
    })

    const newWorkflow = { ...workflow, id: workflowId, createdAt: new Date().toISOString() }
    setWorkflows((prev) => [newWorkflow, ...prev])
    return newWorkflow
  }

  return { workflows, isLoading, createWorkflow }
}

export function useWorkflowById(id: number) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkflow = () => {
      const stmt = db.prepare(`
        SELECT w.*, 
               json_group_array(json_object('id', ws.id, 'workflowId', ws.workflowId, 'role', ws.role, 'description', ws.description, 'orderIndex', ws.orderIndex)) as steps
        FROM workflows w
        LEFT JOIN workflow_steps ws ON w.id = ws.workflowId
        WHERE w.id = ?
        GROUP BY w.id
      `)
      const workflowData = stmt.get(id) as (Workflow & { steps: string }) | undefined
      if (workflowData) {
        const parsedWorkflow = {
          ...workflowData,
          steps: JSON.parse(workflowData.steps) as WorkflowStep[],
        }
        setWorkflow(parsedWorkflow)
      } else {
        setWorkflow(null)
      }
      setIsLoading(false)
    }

    fetchWorkflow()
  }, [id])

  return { workflow, isLoading }
}

