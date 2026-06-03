"use client"

import { useState, useEffect } from "react"

interface SidebarContentWrapperProps {
  children: React.ReactNode
  isAuthenticated?: boolean
}

/**
 * SidebarContentWrapper
 *
 * Wraps all content below the sticky navbar (<main> + <Footer>).
 * When a user is logged in, a sidebar occupies the left 256px (expanded) or
 * 80px (collapsed) on lg+ screens.  This component reads the sidebar state
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
  const [isAuth, setIsAuth] = useState(isAuthenticated ?? false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("topup_sidebar_collapsed")
    setCollapsed(stored === "true")

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

    window.addEventListener("storage", handleStorage)
    window.addEventListener("sidebar-toggle", handleCustom)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("sidebar-toggle", handleCustom)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setIsAuth(isAuthenticated)
      return
    }

    // Auto-detect auth client-side if not explicitly provided
    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setIsAuth(!!data?.user)
      } catch (e) {
        setIsAuth(false)
      }
    }
    checkAuth()
  }, [isAuthenticated])

  if (!isAuth) {
    return <>{children}</>
  }

  return (
    <div
      className="transition-all duration-300 ease-in-out"
      style={
        mounted
          ? {
              // On lg+ screens shift content to clear the sidebar
              // On smaller screens sidebar is hidden so no shift needed
              marginLeft: `var(--sidebar-width, 0px)`,
            }
          : undefined
      }
    >
      <style>{`
        @media (min-width: 1024px) {
          :root {
            --sidebar-width: ${mounted ? (collapsed ? "5rem" : "16rem") : "16rem"};
          }
        }
        @media (max-width: 1023px) {
          :root {
            --sidebar-width: 0px;
          }
        }
      `}</style>
      {children}
    </div>
  )
}
