import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white hover:bg-neutral-800",
        outline:
          "border border-neutral-200 bg-transparent hover:border-neutral-400 hover:text-neutral-900",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900",
        link: "text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline",
      },
      size: {
        default: "h-9 rounded-md px-4 gap-2",
        sm: "h-8 rounded-md px-3 text-xs gap-1.5",
        lg: "h-11 rounded-md px-6 gap-2",
        icon: "h-9 w-9 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
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
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
