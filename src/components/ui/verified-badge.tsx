import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
  size?: "sm" | "md"
}

export function VerifiedBadge({ className, size = "sm" }: VerifiedBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center text-blue-600 font-medium",
        size === "sm" ? "text-xs gap-0.5" : "text-sm gap-1",
        className
      )}
    >
      <CheckCircle className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      <span>Verified</span>
    </span>
  )
}
