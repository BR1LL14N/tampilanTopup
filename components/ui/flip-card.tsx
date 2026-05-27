'use client'

import { ReactNode } from 'react'

interface FlipCardProps {
  frontContent: ReactNode
  backContent: ReactNode
  className?: string
}

export function FlipCard({ frontContent, backContent, className = '' }: FlipCardProps) {
  return (
    <div className={`flip-card h-full ${className}`}>
      <div className="flip-card-inner">
        <div className="flip-card-front glass rounded-lg p-5 transition-all duration-300">
          {frontContent}
        </div>
        <div className="flip-card-back glass rounded-lg p-5 transition-all duration-300">
          {backContent}
        </div>
      </div>
    </div>
  )
}
