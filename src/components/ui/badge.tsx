import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2 transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-omni-cream-deep text-omni-cream-deep bg-transparent",
        secondary:
          "border-omni-forest text-omni-forest bg-transparent [a&]:hover:bg-omni-paper-deep",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground",
        outline:
          "border-border text-foreground [a&]:hover:border-omni-forest",
        accent:
          "border-omni-mint-deep text-omni-ink bg-omni-mint",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
