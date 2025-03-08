"use client"

import { useEffect } from "react"
import { useUserContext } from "@/context/user-context"
import Cookies from "js-cookie"

export function useAuth() {
  const { user } = useUserContext()

  useEffect(() => {
    if (user) {
      // Store user info in session storage for current tab
      sessionStorage.setItem("user", JSON.stringify(user))
      
      // Keep minimal info in cookie for auto-login in new tabs
      Cookies.set("user", JSON.stringify(user), { expires: 7 })
    } else {
      // Remove both session storage and cookie when user is logged out
      sessionStorage.removeItem("user")
      Cookies.remove("user")
    }
  }, [user])

  return { isLoggedIn: !!user }
}

