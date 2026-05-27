'use client'

import { ReactNode } from 'react'

interface FloatingElementProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FloatingElement({ 
  children, 
  delay = 0, 
  duration = 4,
  className = '' 
}: FloatingElementProps) {
  const baseClass = 'floating-element'
  const combinedClass = className ? `${baseClass} ${className}` : baseClass
  
  return (
    <div 
      className={combinedClass}
      style={{
        animation: `float-rotate ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
