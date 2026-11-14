import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-600 text-white shadow hover:bg-cyan-500 active:bg-cyan-700",
        scientific:
          "bg-slate-800 text-cyan-300 border border-cyan-800/60 hover:bg-slate-700/80 hover:border-cyan-500/80 shadow-sm",
        outline:
          "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/60",
        ghost:
          "hover:bg-slate-800/80 text-slate-300 hover:text-slate-100",
        destructive:
          "bg-rose-700 text-rose-100 hover:bg-rose-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-11 rounded-md px-6 text-sm",
        icon: "h-8 w-8",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
