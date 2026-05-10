import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-xs uppercase tracking-[0.18em] font-semibold font-sans transition-all duration-[var(--dur-base)] [transition-timing-function:var(--ease-arch)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-omni-forest text-omni-paper hover:bg-omni-forest-deep border border-omni-forest hover:border-omni-forest-deep",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-omni-forest bg-transparent text-omni-forest hover:bg-omni-forest hover:text-omni-paper",
        secondary:
          "bg-omni-cream text-omni-ink border border-omni-cream-deep hover:bg-omni-cream-soft",
        accent:
          "bg-omni-mint text-omni-ink border border-omni-mint-deep hover:bg-omni-mint-deep",
        ghost:
          "border border-transparent hover:border-omni-forest hover:bg-transparent text-omni-forest",
        link: "text-omni-forest underline underline-offset-4 hover:text-omni-forest-deep border-none",
      },
      size: {
        default: "h-11 px-7 py-3 has-[>svg]:px-5",
        sm: "h-9 px-4 has-[>svg]:px-3 text-[10px]",
        lg: "h-12 px-9 has-[>svg]:px-6 text-xs",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
