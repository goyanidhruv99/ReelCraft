import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4DFF]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#6C4DFF] text-white hover:bg-[#5B3FE6] shadow-sm shadow-[#6C4DFF]/20",
        gradient:
          "bg-gradient-to-r from-[#6C4DFF] to-[#8B5CF6] text-white hover:from-[#5B3FE6] hover:to-[#7C4FE8] shadow-sm shadow-[#6C4DFF]/25",
        secondary:
          "bg-white text-[#172033] border border-[#E4E7F5] hover:bg-[#F5F7FF]",
        ghost: "text-[#172033] hover:bg-[#EEF0FB]",
        outline:
          "border border-[#E4E7F5] bg-transparent text-[#172033] hover:bg-white",
        danger:
          "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
