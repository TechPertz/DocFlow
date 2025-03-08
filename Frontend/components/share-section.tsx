"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface ShareSectionProps {
  documentId: string
}

interface SharedUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: "editor" | "viewer"
}

export default function ShareSection({ documentId }: ShareSectionProps) {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "editor",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "viewer",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
  ])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<"editor" | "viewer">("viewer")
  const { toast } = useToast()

  const handleAddUser = () => {
    if (!newUserEmail.trim()) return

    const newUser: SharedUser = {
      id: `temp-${Date.now()}`,
      name: newUserEmail.split("@")[0], // Use part of email as name for demo
      email: newUserEmail,
      role: newUserRole,
      avatarUrl: "/placeholder.svg?height=40&width=40",
    }

    setSharedUsers([...sharedUsers, newUser])
    setNewUserEmail("")
    setNewUserRole("viewer")

    toast({
      title: "User added",
      description: `${newUserEmail} has been added as a ${newUserRole}.`,
    })
  }

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter((user) => user.id !== userId))
    toast({
      title: "User removed",
      description: "The user has been removed from the shared list.",
    })
  }

  const handleRoleChange = (userId: string, newRole: "editor" | "viewer") => {
    setSharedUsers(sharedUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    toast({
      title: "Role updated",
      description: `User's role has been updated to ${newRole}.`,
    })
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Share with others</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1 rounded-full bg-white/50 dark:bg-gray-800/50"
          />
          <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as "editor" | "viewer")}>
            <SelectTrigger className="w-[120px] rounded-full bg-white/50 dark:bg-gray-800/50">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddUser} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Share
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">People with access</h3>
        <AnimatePresence initial={false}>
          {sharedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-indigo-700 dark:text-indigo-300">{user.name}</p>
                  <p className="text-sm text-indigo-500 dark:text-indigo-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as "editor" | "viewer")}
                >
                  <SelectTrigger className="w-[100px] rounded-full bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveUser(user.id)}
                  className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

