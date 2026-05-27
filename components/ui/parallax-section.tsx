'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  offset?: number
  className?: string
}

export function ParallaxSection({ 
  children, 
  offset = 50,
  className = '' 
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      
      const rect = ref.current.getBoundingClientRect()
      const elementCenter = rect.top + rect.height / 2
      const windowCenter = window.innerHeight / 2
      const distance = (elementCenter - windowCenter) / 5
      
      setTranslateY(distance * 0.5)
    }

    const scrollListener = () => {
      requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', scrollListener, { passive: true })
    return () => window.removeEventListener('scroll', scrollListener)
  }, [])

  return (
    <div 
      ref={ref}
      className={`parallax-section transition-transform duration-100 ${className}`}
      style={{
        transform: `translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  )
}
