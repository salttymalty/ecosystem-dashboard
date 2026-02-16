"use client"

import { useMemo } from "react"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import { DOMAIN_COLORS } from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

export function DecisionsView() {
  const { activeDomain, setDetailPanel } = useDashboard()
  const { decisions, projects } = useEcosystemData()

  const filtered = useMemo(() => {
    if (!activeDomain) return decisions
    return decisions.filter((d) =>
      d.projectIds.some((pid) => {
        const project = projects.find((p) => p.id === pid || p.name === pid)
        return project?.domain === activeDomain
      })
    )
  }, [activeDomain, decisions, projects])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Decisions</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} decisions</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0">
          {filtered.map((decision, i) => (
            <button
              key={decision.id}
              onClick={() => setDetailPanel({ type: "decision", id: decision.id })}
              className="w-full text-left relative pl-10 pr-4 py-4 hover:bg-accent/30 transition-colors rounded-lg animate-fade-in-up group"
              style={{ animationDelay: `${i * 50}ms` }}
              type="button"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-[11px] top-5 w-2.5 h-2.5 rounded-full border-2 border-card"
                style={{ backgroundColor: "hsl(15 70% 55%)" }}
              />

              {/* Date */}
              <div className="text-xs text-muted-foreground font-mono mb-1">{decision.date}</div>

              {/* Summary */}
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-2">
                {decision.summary}
              </h3>

              {/* Rationale */}
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{decision.rationale}</p>

              {/* Tags + Projects */}
              <div className="flex items-center gap-2 flex-wrap">
                {decision.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-muted-foreground text-xs">&middot;</span>
                {decision.projectIds.map((pid) => {
                  const project = projects.find((p) => p.id === pid || p.name === pid)
                  if (!project) return null
                  return (
                    <span
                      key={pid}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: DOMAIN_COLORS[project.domain] }}
                      />
                      {project.name}
                    </span>
                  )
                })}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
