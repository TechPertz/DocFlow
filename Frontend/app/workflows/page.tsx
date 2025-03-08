"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Settings, Users, Workflow } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkflows } from "@/hooks/use-workflows"
import WorkflowCard from "@/components/workflow-card"
import CreateWorkflowDialog from "@/components/create-workflow-dialog"

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "my" | "team">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { workflows, isLoading } = useWorkflows()

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "my") return matchesSearch && workflow.createdBy.id === "current-user"
    if (activeTab === "team") return matchesSearch && workflow.teamId === "current-team"

    return false
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl overflow-hidden">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold">Workflow Management</h2>
              <p className="text-indigo-100">Create and manage approval workflows for your organization</p>
            </div>
            <Button
              className="rounded-full bg-white text-indigo-600 hover:bg-indigo-100"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "my" | "team")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 rounded-full bg-indigo-100 dark:bg-indigo-900 p-1">
              <TabsTrigger
                value="all"
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
              >
                <Workflow className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">All Workflows</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">My Workflows</span>
                <span className="sm:hidden">My</span>
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800"
              >
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Team Workflows</span>
                <span className="sm:hidden">Team</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <Input
              placeholder="Search workflows..."
              className="pl-10 w-full sm:w-[250px] rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl">
                <CardContent className="flex h-40 flex-col items-center justify-center p-6">
                  <p className="text-center text-indigo-600 dark:text-indigo-400">No workflows found</p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CreateWorkflowDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </div>
  )
}

