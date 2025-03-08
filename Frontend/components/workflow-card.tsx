"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Workflow } from "lucide-react"
import { motion } from "framer-motion"
import type { Workflow as WorkflowType } from "@/hooks/use-workflows"

interface WorkflowCardProps {
  workflow: WorkflowType
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/workflows/${workflow.id}`}>
        <Card className="h-full overflow-hidden transition-all hover:shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border-2 border-indigo-100 dark:border-indigo-900">
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Workflow</span>
              </div>
              <Badge variant={workflow.active ? "default" : "outline"} className="rounded-full">
                {workflow.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-indigo-900 dark:text-indigo-100">{workflow.name}</h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4 line-clamp-2">
              {workflow.description || "No description provided"}
            </p>

            <div className="flex flex-wrap gap-2">
              {workflow.steps.slice(0, 3).map((step, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                >
                  {step.role}
                </Badge>
              ))}
              {workflow.steps.length > 3 && (
                <Badge
                  variant="outline"
                  className="rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                >
                  +{workflow.steps.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-indigo-100 dark:border-indigo-900 p-4 bg-indigo-50 dark:bg-indigo-950">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg?height=30&width=30" alt="Creator" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <span className="text-xs text-indigo-600 dark:text-indigo-400">Created by User</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                {new Date(workflow.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

