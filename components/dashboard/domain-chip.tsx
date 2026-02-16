"use client"

import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

export function DomainChip({
  domain,
  size = "sm",
  showLabel = true,
  interactive = true,
}: {
  domain: string
  size?: "xs" | "sm" | "md"
  showLabel?: boolean
  interactive?: boolean
}) {
  const { activeDomain, setActiveDomain } = useDashboard()
  const color = DOMAIN_COLORS[domain] || "#888"
  const label = DOMAIN_LABELS[domain] || domain
  const isActive = activeDomain === domain
  const isFiltered = activeDomain !== null && activeDomain !== domain

  return (
    <button
      onClick={() => {
        if (!interactive) return
        setActiveDomain(isActive ? null : domain)
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md transition-all duration-200",
        size === "xs" && "px-1.5 py-0.5 text-xs",
        size === "sm" && "px-2 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        !interactive && "cursor-default",
        isActive && "ring-2 ring-offset-1 ring-offset-background",
        isFiltered && "opacity-30"
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        ...(isActive ? { ["--tw-ring-color" as string]: color } : {}),
      }}
      type="button"
      aria-pressed={isActive}
      aria-label={`Filter by ${label}`}
    >
      <span
        className={cn(
          "rounded-full",
          size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
        style={{ backgroundColor: color }}
      />
      {showLabel && <span className="font-medium">{label}</span>}
    </button>
  )
}
