"use client"

import { useEffect } from "react"

export default function DynamicFavicon() {
  useEffect(() => {
    const applyFavicon = async () => {
      try {
        const res = await fetch("/api/settings/public")
        const data = await res.json()
        const faviconUrl = data.favicon_url
        if (!faviconUrl) return

        const existingIcons = document.querySelectorAll("link[rel*='icon']")
        existingIcons.forEach((el) => el.parentNode?.removeChild(el))

        const link = document.createElement("link")
        link.rel = "icon"
        link.href = faviconUrl
        document.head.appendChild(link)
      } catch (err) {
        console.error("Failed to apply dynamic favicon:", err)
      }
    }
    applyFavicon()
  }, [])

  return null
}
