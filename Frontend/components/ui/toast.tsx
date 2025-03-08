"use client"

import type * as React from "react"

interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

interface UseToastReturn {
  toast: ({
    title,
    description,
    variant,
  }: { title?: string; description?: string; variant?: "default" | "destructive" }) => void
}

export const useToast = (): UseToastReturn => {
  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }) => {
    console.log(`Toast: ${title} - ${description} (${variant})`)
  }

  return { toast }
}

