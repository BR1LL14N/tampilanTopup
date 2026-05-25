import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-extrabold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-300 text-ink hover:bg-cyan-200 hover:scale-105",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 hover:scale-105",
        outline:
          "border border-white/10 bg-white/10 text-white hover:bg-white/15 hover:border-cyan-300/40 hover:scale-105",
        secondary:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10",
        ghost: "hover:bg-white/10 hover:text-white",
        link: "text-cyan-200 underline-offset-4 hover:underline",
        accent:
          "border border-cyan-300/50 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-10 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }