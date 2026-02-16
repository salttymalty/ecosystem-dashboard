"use client"

import { useMemo } from "react"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import {
  DOMAIN_COLORS,
  predictStaleness,
} from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { Sparkline } from "../sparkline"
import { DomainChip } from "../domain-chip"
import { AnimatedNumber } from "../animated-number"
import {
  GitCommit,
  Clock,
  Target,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Github,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ProjectsView() {
  const { activeDomain, setDetailPanel } = useDashboard()
  const { projects, goals, sessions, timelineData } = useEcosystemData()

  const filteredProjects = useMemo(
    () => (activeDomain ? projects.filter((p) => p.domain === activeDomain) : projects),
    [activeDomain, projects]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Projects</h1>
        <span className="text-sm text-muted-foreground">
          {filteredProjects.length} project{filteredProjects.length !== 1 && "s"}
        </span>
      </div>

      <div className="space-y-3">
        {filteredProjects.map((project, i) => {
          const projectGoals = goals.filter((g) => g.projectId === project.id)
          const projectSessions = sessions.filter((s) => s.projectIds.includes(project.id))
          const daysUntilStale = predictStaleness(project, timelineData)
          const recentHours = timelineData
            .slice(-14)
            .reduce((s, d) => s + (d.domains[project.domain] || 0), 0)

          return (
            <button
              key={project.id}
              onClick={() => setDetailPanel({ type: "project", id: project.id })}
              className="w-full text-left p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 animate-fade-in-up group"
              style={{
                animationDelay: `${i * 60}ms`,
                boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)",
              }}
              type="button"
            >
              <div className="flex items-start gap-4">
                {/* Color bar */}
                <div
                  className="w-1 h-full min-h-[60px] rounded-full shrink-0"
                  style={{ backgroundColor: DOMAIN_COLORS[project.domain] }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          project.state === "active" && "bg-emerald-500/15 text-emerald-400",
                          project.state === "paused" && "bg-amber-500/15 text-amber-400",
                          project.state === "stale" && "bg-red-500/15 text-red-400",
                          project.state === "archived" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {project.state}
                      </span>
                      {daysUntilStale !== null && daysUntilStale <= 3 && (
                        <span className="text-amber-400 flex items-center gap-0.5 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          {daysUntilStale === 0 ? "Stale" : `${daysUntilStale}d to stale`}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono">{project.commitCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{recentHours.toFixed(1)}h / 14d</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span className="font-mono">
                        {projectGoals.filter((g) => g.status === "done").length}/{projectGoals.length}
                      </span>
                    </div>
                    <DomainChip domain={project.domain} size="xs" />
                    {project.links?.repo && (
                      <a
                        href={project.links.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-accent/80 transition-colors"
                        title="GitHub"
                      >
                        <Github className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                    {project.links?.site && (
                      <a
                        href={project.links.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-accent/80 transition-colors"
                        title="Live site"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                    <div className="ml-auto">
                      <Sparkline
                        data={project.recentCommits.map((c) => c.count).reverse()}
                        width={100}
                        height={24}
                        color={DOMAIN_COLORS[project.domain]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
