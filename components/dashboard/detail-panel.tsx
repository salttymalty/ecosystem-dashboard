"use client"

import { useDashboard } from "@/lib/dashboard-store"
import {
  projects,
  decisions,
  sessions,
  goals,
  DOMAIN_COLORS,
  DOMAIN_LABELS,
} from "@/lib/ecosystem-data"
import { DomainChip } from "./domain-chip"
import { X, ExternalLink, GitCommit, Clock, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function DetailPanel() {
  const { detailPanel, setDetailPanel } = useDashboard()

  if (!detailPanel) return null

  const renderContent = () => {
    switch (detailPanel.type) {
      case "project": {
        const project = projects.find((p) => p.id === detailPanel.id)
        if (!project) return <p className="text-muted-foreground">Project not found</p>

        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">{project.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              </div>
            </div>
            <DomainChip domain={project.domain} size="md" />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <GitCommit className="h-3 w-3" />
                  Commits
                </div>
                <p className="text-lg font-semibold text-foreground font-mono">{project.commitCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  Stale Days
                </div>
                <p className="text-lg font-semibold text-foreground font-mono">{project.staleDays}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Related Goals</h4>
              {goals
                .filter((g) => g.projectId === project.id)
                .map((g) => (
                  <button
                    key={g.id}
                    className="w-full text-left p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    onClick={() => setDetailPanel({ type: "goal", id: g.id })}
                    type="button"
                  >
                    <span className="text-sm text-foreground">{g.title}</span>
                    <span
                      className={cn(
                        "ml-2 text-xs px-1.5 py-0.5 rounded",
                        g.status === "done" && "bg-emerald-500/20 text-emerald-400",
                        g.status === "in-progress" && "bg-amber-500/20 text-amber-400",
                        g.status === "blocked" && "bg-red-500/20 text-red-400",
                        g.status === "planned" && "bg-blue-500/20 text-blue-400"
                      )}
                    >
                      {g.status}
                    </span>
                  </button>
                ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Related Decisions</h4>
              {decisions
                .filter((d) => d.projectIds.includes(project.id))
                .map((d) => (
                  <button
                    key={d.id}
                    className="w-full text-left p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    onClick={() => setDetailPanel({ type: "decision", id: d.id })}
                    type="button"
                  >
                    <span className="text-sm text-foreground">{d.summary}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{d.date}</span>
                  </button>
                ))}
            </div>
          </div>
        )
      }
      case "decision": {
        const decision = decisions.find((d) => d.id === detailPanel.id)
        if (!decision) return <p className="text-muted-foreground">Decision not found</p>

        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{decision.summary}</h3>
              <p className="text-xs text-muted-foreground mt-1">{decision.date}</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/50">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Rationale</h4>
              <p className="text-sm text-foreground leading-relaxed">{decision.rationale}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {decision.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Linked Projects</h4>
              {decision.projectIds.map((pid) => {
                const project = projects.find((p) => p.id === pid)
                if (!project) return null
                return (
                  <button
                    key={pid}
                    className="w-full text-left p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors flex items-center gap-2"
                    onClick={() => setDetailPanel({ type: "project", id: pid })}
                    type="button"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[project.domain] }} />
                    <span className="text-sm text-foreground">{project.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      }
      case "goal": {
        const goal = goals.find((g) => g.id === detailPanel.id)
        if (!goal) return <p className="text-muted-foreground">Goal not found</p>
        const project = projects.find((p) => p.id === goal.projectId)

        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{goal.title}</h3>
              <span
                className={cn(
                  "inline-block mt-2 text-xs px-2 py-0.5 rounded",
                  goal.status === "done" && "bg-emerald-500/20 text-emerald-400",
                  goal.status === "in-progress" && "bg-amber-500/20 text-amber-400",
                  goal.status === "blocked" && "bg-red-500/20 text-red-400",
                  goal.status === "planned" && "bg-blue-500/20 text-blue-400"
                )}
              >
                {goal.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-accent/50">
                <div className="text-xs text-muted-foreground mb-1">Target</div>
                <p className="text-sm font-mono text-foreground">{goal.targetDate}</p>
              </div>
              {goal.completedDate && (
                <div className="p-3 rounded-lg bg-accent/50">
                  <div className="text-xs text-muted-foreground mb-1">Completed</div>
                  <p className="text-sm font-mono text-foreground">{goal.completedDate}</p>
                </div>
              )}
            </div>
            {project && (
              <button
                className="w-full text-left p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors flex items-center gap-2"
                onClick={() => setDetailPanel({ type: "project", id: project.id })}
                type="button"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[project.domain] }} />
                <span className="text-sm text-foreground">{project.name}</span>
                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
              </button>
            )}
          </div>
        )
      }
      case "session": {
        const session = sessions.find((s) => s.id === detailPanel.id)
        if (!session) return <p className="text-muted-foreground">Session not found</p>

        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{session.summary}</h3>
              <p className="text-xs text-muted-foreground mt-1">{session.date} &middot; {session.duration}h</p>
            </div>
            <DomainChip domain={session.domain} size="md" />
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Artifacts</h4>
              {session.artifacts.map((a) => (
                <div key={a} className="text-sm font-mono text-foreground p-2 rounded-lg bg-accent/50">
                  {a}
                </div>
              ))}
            </div>
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-80 z-30 bg-card border-l border-border animate-slide-in-right overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {detailPanel.type}
        </span>
        <button
          onClick={() => setDetailPanel(null)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
          type="button"
          aria-label="Close detail panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">{renderContent()}</div>
    </div>
  )
}
