"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, User, Settings, LogOut, Moon, Sun, Workflow, FileText, FileCheck, Shield, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; organization: string } | null>(null)

  useEffect(() => {
    // First check session storage
    const sessionUser = typeof window !== 'undefined' ? sessionStorage.getItem("user") : null
    if (sessionUser) {
      setUser(JSON.parse(sessionUser))
      return
    }

    // Fall back to cookie if no session data
    const userCookie = Cookies.get("user")
    if (userCookie) {
      const userData = JSON.parse(userCookie)
      setUser(userData)
      // Copy to session storage
      sessionStorage.setItem("user", userCookie)
    }
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar="true"]')
      if (open && sidebar && !sidebar.contains(event.target as Node)) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  const routes = [
    {
      label: "Documents",
      icon: FileText,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Approvals",
      icon: FileCheck,
      href: "/approvals",
      active: pathname === "/approvals",
    },
    {
      label: "Workflows",
      icon: Workflow,
      href: "/workflows",
      active: pathname === "/workflows" || pathname?.startsWith("/workflows/"),
    },
    {
      label: "Compliance",
      icon: Shield,
      href: "/compliance",
      active: pathname === "/compliance",
    },
  ]

  const handleLogout = () => {
    // Clear both storages
    sessionStorage.removeItem("user")
    Cookies.remove("user")
    router.push("/login")
  }

  // Update the click handler to ensure it calls onClose
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } transition-opacity duration-300`}
        onClick={onClose}
      />
      <motion.div
        initial={false} // Disable initial animation
        animate={{ 
          x: open ? 0 : '-100%',
          transition: {
            duration: 0.3
          }
        }}
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r transition-transform lg:static",
          // Only apply transform on mobile
          "lg:translate-x-0",
          !open && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <FileCheck className="h-5 w-5 text-primary" />
              <span>DocFlow</span>
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
            </div>
            <nav className="grid gap-1 px-2 py-2">
              {routes.map((route, index) => (
                <motion.div
                  key={route.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={route.href}>
                    <Button
                      variant={route.active ? "secondary" : "ghost"}
                      className={cn("w-full justify-start gap-2", {
                        "bg-secondary": route.active,
                      })}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=30&width=30" />
                    <AvatarFallback>{user?.username?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span>{user?.username || "Guest"}</span>
                    <span className="text-xs text-muted-foreground">{user?.organization || "No Organization"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    </>
  )
}

