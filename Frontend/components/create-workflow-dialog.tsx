"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Workflow, Plus, X, MoveUp, MoveDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface CreateWorkflowDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface WorkflowStep {
  role: string
  description: string
}

export default function CreateWorkflowDialog({ isOpen, onClose }: CreateWorkflowDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [team, setTeam] = useState("")
  const [steps, setSteps] = useState<WorkflowStep[]>([{ role: "", description: "" }])
  const { toast } = useToast()

  const handleAddStep = () => {
    setSteps([...steps, { role: "", description: "" }])
  }

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) return
    setSteps(steps.filter((_, i) => i !== index))
  }

  const handleMoveStepUp = (index: number) => {
    if (index === 0) return
    const newSteps = [...steps]
    const temp = newSteps[index]
    newSteps[index] = newSteps[index - 1]
    newSteps[index - 1] = temp
    setSteps(newSteps)
  }

  const handleMoveStepDown = (index: number) => {
    if (index === steps.length - 1) return
    const newSteps = [...steps]
    const temp = newSteps[index]
    newSteps[index] = newSteps[index + 1]
    newSteps[index + 1] = temp
    setSteps(newSteps)
  }

  const handleStepChange = (index: number, field: keyof WorkflowStep, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const handleCreateWorkflow = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your workflow",
        variant: "destructive",
      })
      return
    }

    if (steps.some((step) => !step.role)) {
      toast({
        title: "Invalid steps",
        description: "All steps must have a role assigned",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Workflow created",
      description: `"${name}" workflow has been created successfully.`,
    })
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setTeam("")
    setSteps([{ role: "", description: "" }])
  }

  const teams = [
    { id: "team1", name: "Engineering" },
    { id: "team2", name: "Marketing" },
    { id: "team3", name: "Product" },
    { id: "team4", name: "Design" },
    { id: "team5", name: "Sales" },
  ]

  const roles = [
    "Junior Developer",
    "Senior Developer",
    "Team Lead",
    "Product Manager",
    "Department Head",
    "Director",
    "VP",
    "C-Level Executive",
    "Designer",
    "QA Engineer",
    "DevOps Engineer",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Create New Workflow
          </DialogTitle>
          <DialogDescription>Define a new approval workflow for your organization</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              placeholder="e.g., Document Approval Process"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this workflow"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="team">Team</Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Approval Steps</Label>
              <Button variant="outline" size="sm" onClick={handleAddStep} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add Step
              </Button>
            </div>

            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-md border p-4"
                >
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveStepUp(index)}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3.5 w-3.5" />
                      <span className="sr-only">Move Up</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveStepDown(index)}
                      disabled={index === steps.length - 1}
                    >
                      <MoveDown className="h-3.5 w-3.5" />
                      <span className="sr-only">Move Down</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveStep(index)}
                      disabled={steps.length === 1}
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">
                      Step {index + 1}
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`step-${index}-role`}>Role</Label>
                      <Select value={step.role} onValueChange={(value) => handleStepChange(index, "role", value)}>
                        <SelectTrigger id={`step-${index}-role`}>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`step-${index}-description`}>Description (Optional)</Label>
                      <Input
                        id={`step-${index}-description`}
                        placeholder="e.g., Review code changes"
                        value={step.description}
                        onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

