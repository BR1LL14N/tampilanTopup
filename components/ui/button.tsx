import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-extrabold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-sky text-white hover:bg-diamond hover:scale-105 active:scale-95",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 hover:scale-105 active:scale-95",
        outline:
          "border-2 border-sky text-sky bg-white hover:bg-sky/5 hover:scale-105 active:scale-95",
        secondary:
          "bg-mist text-text-primary hover:bg-ice border border-sky-border hover:scale-105 active:scale-95",
        ghost: "hover:bg-ice text-text-secondary hover:text-text-primary",
        link: "text-sky underline-offset-4 hover:underline",
        accent:
          "border border-sky/50 bg-sky/10 text-diamond hover:bg-sky/20 hover:scale-105 active:scale-95",
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
