"use client"

import { useState, useEffect } from "react"
import { getCachedUser } from "@/lib/auth-cache"

interface SidebarContentWrapperProps {
  children: React.ReactNode
  isAuthenticated?: boolean
}

/**
 * SidebarContentWrapper
 *
 * Wraps all content below the sticky navbar (<main> + <Footer>).
 * When a user is logged in, a sidebar occupies the left 256px (expanded) or
 * 80px (collapsed) on lg+ screens. This component reads the sidebar state
 * from localStorage and applies a matching `margin-left` so content never
 * hides behind the sidebar – and transitions smoothly when the sidebar
 * is toggled.
 *
 * On mobile (<lg) the sidebar is hidden, so no margin is applied.
 */
export function SidebarContentWrapper({
  children,
  isAuthenticated,
}: SidebarContentWrapperProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuth, setIsAuth] = useState(() => {
    if (isAuthenticated !== undefined) return isAuthenticated
    return false
  })
  const [isTransitionReady, setIsTransitionReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("topup_sidebar_collapsed")
    setCollapsed(stored === "true")

    // Retrieve cached user on mount to update client-side auth state
    if (isAuthenticated === undefined) {
      const cached = getCachedUser()
      setIsAuth(!!cached)
    }

    // Listen for sidebar toggle events dispatched by the Header component
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "topup_sidebar_collapsed") {
        setCollapsed(e.newValue === "true")
      }
    }

    // Also listen to a custom event so same-tab toggles are caught
    const handleCustom = (e: Event) => {
      const stored = localStorage.getItem("topup_sidebar_collapsed")
      setCollapsed(stored === "true")
    }

    // Listen to global auth state changes
    const handleAuthChange = () => {
      const cached = getCachedUser()
      setIsAuth(!!cached)
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("sidebar-toggle", handleCustom)
    window.addEventListener("auth-state-change", handleAuthChange)

    // Delay enabling transitions to avoid layout jump animation on initial mount
    const timer = setTimeout(() => {
      setIsTransitionReady(true)
    }, 50)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("sidebar-toggle", handleCustom)
      window.removeEventListener("auth-state-change", handleAuthChange)
      clearTimeout(timer)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const htmlEl = document.documentElement
      if (isAuth) {
        htmlEl.classList.add("has-user")
        htmlEl.classList.remove("no-user")
        if (collapsed) {
          htmlEl.classList.add("sidebar-collapsed")
          htmlEl.classList.remove("sidebar-expanded")
        } else {
          htmlEl.classList.add("sidebar-expanded")
          htmlEl.classList.remove("sidebar-collapsed")
        }
      } else {
        htmlEl.classList.add("no-user")
        htmlEl.classList.remove("has-user", "sidebar-collapsed", "sidebar-expanded")
      }
    }
  }, [isAuth, collapsed])

  useEffect(() => {
    // If explicitly authenticated via prop, set it immediately
    if (isAuthenticated !== undefined) {
      setIsAuth(isAuthenticated)
      return
    }

    // Otherwise, perform background check to keep state in sync
    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        const hasSession = !!data?.session
        setIsAuth(hasSession)
        
        // Update the cache if mismatch is found
        const currentCache = getCachedUser()
        if (hasSession && !currentCache) {
          const { setCachedUser } = await import("@/lib/auth-cache")
          setCachedUser({
            name: data.session?.user.user_metadata?.name || data.session?.user.email || '',
            email: data.session?.user.email || '',
            role: data.session?.user.user_metadata?.role || 'user'
          })
        } else if (!hasSession && currentCache) {
          const { setCachedUser } = await import("@/lib/auth-cache")
          setCachedUser(null)
        }
      } catch (e) {
        setIsAuth(false)
      }
    }
    checkAuth()
  }, [isAuthenticated])

  return (
    <div
      className={`sidebar-content-wrapper ${
        isTransitionReady ? "transition-all duration-300 ease-in-out" : ""
      } ${
        isAuth
          ? mounted && collapsed
            ? "lg:ml-20"
            : "lg:ml-64"
          : "lg:ml-0"
      }`}
    >
      {children}
    </div>
  )
}
