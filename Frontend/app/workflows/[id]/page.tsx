"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useWorkflowById } from "@/hooks/use-workflows"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Edit, Trash, User, Workflow } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WorkflowDetailPage() {
  const { id } = useParams()
  const { workflow, isLoading } = useWorkflowById(id as string)
  const [activeTab, setActiveTab] = useState<"overview" | "documents">("overview")

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!workflow) {
    return <div>Workflow not found</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col gap-6 p-8"
      >
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{workflow.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Created: {new Date(workflow.createdAt).toLocaleDateString()}
                </span>
                <Badge variant={workflow.active ? "default" : "outline"}>
                  {workflow.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-destructive">
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "overview" | "documents")}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-3"
            >
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Workflow Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {workflow.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {index + 1}
                          </div>
                          {index < workflow.steps.length - 1 && <div className="mt-2 h-full w-px bg-border"></div>}
                        </div>
                        <div className="flex-1 space-y-1 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{step.role}</h3>
                            <Badge variant="outline" className="bg-background">
                              Step {index + 1}
                            </Badge>
                          </div>
                          {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Created By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={workflow.createdBy.avatarUrl} alt={workflow.createdBy.name} />
                        <AvatarFallback>{workflow.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{workflow.createdBy.name}</p>
                        <p className="text-sm text-muted-foreground">{workflow.team}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {workflow.description || "No description provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Team</p>
                      <p className="text-sm text-muted-foreground">{workflow.team}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{new Date(workflow.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${workflow.active ? "bg-green-500" : "bg-gray-400"}`}
                        ></div>
                        <p className="text-sm text-muted-foreground">{workflow.active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
          <TabsContent value="documents" className="mt-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                  <p className="text-center text-muted-foreground">No documents are currently using this workflow</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  )
}

