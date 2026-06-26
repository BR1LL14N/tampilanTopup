"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      !("workbox" in window)
    ) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("Service Worker registered successfully with scope:", registration.scope)
        } catch (error) {
          console.error("Service Worker registration failed:", error)
        }
      }

      // Register SW after page load to prevent blocking the main thread
      if (document.readyState === "complete") {
        registerServiceWorker()
      } else {
        window.addEventListener("load", registerServiceWorker)
        return () => window.removeEventListener("load", registerServiceWorker)
      }
    }
  }, [])

  return null
}
