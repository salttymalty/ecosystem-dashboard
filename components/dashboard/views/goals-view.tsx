"use client"

import { useMemo } from "react"
import { goals, projects, DOMAIN_COLORS } from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react"

const STATUS_CONFIG = {
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Done" },
  "in-progress": { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15", label: "In Progress" },
  blocked: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/15", label: "Blocked" },
  planned: { icon: Circle, color: "text-blue-400", bg: "bg-blue-500/15", label: "Planned" },
}

export function GoalsView() {
  const { activeDomain, setDetailPanel } = useDashboard()

  const filtered = useMemo(() => {
    if (!activeDomain) return goals
    return goals.filter((g) => projects.find((p) => p.id === g.projectId)?.domain === activeDomain)
  }, [activeDomain])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof goals> = {
      "in-progress": [],
      blocked: [],
      planned: [],
      done: [],
    }
    filtered.forEach((g) => {
      groups[g.status]?.push(g)
    })
    return groups
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Goals</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{filtered.filter((g) => g.status === "done").length} done</span>
          <span>{filtered.filter((g) => g.status === "in-progress").length} active</span>
          <span>{filtered.filter((g) => g.status === "blocked").length} blocked</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(25 10% 16%)" }}>
        {(["done", "in-progress", "blocked", "planned"] as const).map((status) => {
          const count = grouped[status]?.length || 0
          const pct = (count / Math.max(filtered.length, 1)) * 100
          const cfg = STATUS_CONFIG[status]
          return (
            <div
              key={status}
              className="h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  status === "done"
                    ? "#81b29a"
                    : status === "in-progress"
                    ? "#f2cc8f"
                    : status === "blocked"
                    ? "#e07a5f"
                    : "hsl(25 10% 25%)",
              }}
            />
          )
        })}
      </div>

      {/* Grouped lists */}
      {(["in-progress", "blocked", "planned", "done"] as const).map((status) => {
        const items = grouped[status]
        if (!items || items.length === 0) return null
        const cfg = STATUS_CONFIG[status]
        const Icon = cfg.icon

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("h-4 w-4", cfg.color)} />
              <h2 className="text-sm font-medium text-foreground">{cfg.label}</h2>
              <span className="text-xs text-muted-foreground">({items.length})</span>
            </div>
            <div className="space-y-2">
              {items.map((goal, i) => {
                const project = projects.find((p) => p.id === goal.projectId)
                return (
                  <button
                    key={goal.id}
                    onClick={() => setDetailPanel({ type: "goal", id: goal.id })}
                    className="w-full text-left p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 animate-fade-in-up group"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)",
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {project && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: DOMAIN_COLORS[project.domain] }}
                          />
                        )}
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{goal.targetDate}</span>
                    </div>
                    {project && (
                      <span className="text-xs text-muted-foreground mt-1 block pl-4">
                        {project.name}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
