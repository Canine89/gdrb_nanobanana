import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA — Terracotta Brand
        default:
          "bg-primary text-primary-foreground shadow-ring-brand hover:brightness-95 active:brightness-90",
        // Warm Sand Secondary — the workhorse
        secondary:
          "bg-secondary text-secondary-foreground shadow-ring-warm hover:bg-claude-sand/80",
        // Dark Charcoal — inverted accent
        dark:
          "bg-claude-dark-surface text-claude-ivory shadow-ring-deep hover:brightness-110",
        // Outline — warm cream border on ivory
        outline:
          "border border-claude-border-cream bg-claude-ivory text-foreground hover:bg-claude-sand/60",
        // Destructive — Error Crimson
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-95",
        // Ghost — transparent hover warm
        ghost:
          "text-foreground hover:bg-claude-sand/70",
        // Link — terracotta underline
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-6 rounded-lg text-base",
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
