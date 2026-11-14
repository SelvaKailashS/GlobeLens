import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 gap-1",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-cyan-900/60 text-cyan-200 border-cyan-700/50",
        secondary:
          "border border-slate-700 bg-slate-800 text-slate-300",
        outline:
          "border border-slate-700 text-slate-300",
        destructive:
          "border border-rose-800/60 bg-rose-950/60 text-rose-300",
        success:
          "border border-emerald-800/60 bg-emerald-950/60 text-emerald-300",
        warning:
          "border border-amber-800/60 bg-amber-950/60 text-amber-300",
        scientific:
          "border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
