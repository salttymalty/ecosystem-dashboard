"use client"

import { useMemo } from "react"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import {
  generateNarratives,
  detectDomainGaps,
  predictStaleness,
  DOMAIN_COLORS,
  DOMAIN_LABELS,
} from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { AnimatedNumber } from "../animated-number"
import { HeatmapCalendar } from "../heatmap-calendar"
import { Sparkline } from "../sparkline"
import { DomainChip } from "../domain-chip"
import { RadarBalance } from "../radar-balance"
import {
  Layers,
  GitCommit,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function OverviewView() {
  const { activeDomain, setDetailPanel, setActiveView } = useDashboard()
  const { projects, timelineData, energyLogs, goals, sessions } = useEcosystemData()

  const filteredProjects = useMemo(
    () => (activeDomain ? projects.filter((p) => p.domain === activeDomain) : projects),
    [activeDomain, projects]
  )

  const filteredTimeline = useMemo(
    () =>
      activeDomain
        ? timelineData.map((d) => ({
            ...d,
            totalHours: d.domains[activeDomain] || 0,
          }))
        : timelineData,
    [activeDomain, timelineData]
  )

  const narratives = useMemo(
    () => generateNarratives(timelineData, energyLogs),
    [timelineData, energyLogs]
  )

  const gaps = useMemo(() => detectDomainGaps(timelineData), [timelineData])

  const stats = useMemo(() => {
    const totalHours = filteredTimeline.slice(-30).reduce((s, d) => s + d.totalHours, 0)
    const totalCommits = filteredProjects.reduce((s, p) => s + p.commitCount, 0)
    const activeProjects = filteredProjects.filter((p) => p.state === "active").length
    const completedGoals = goals.filter((g) => g.status === "done").length
    const avgEnergy =
      energyLogs.slice(-7).reduce((s, e) => s + e.energy, 0) / Math.max(energyLogs.slice(-7).length, 1)
    return { totalHours, totalCommits, activeProjects, completedGoals, avgEnergy }
  }, [filteredProjects, filteredTimeline, goals, energyLogs])

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Hours (30d)",
            value: stats.totalHours,
            decimals: 1,
            suffix: "h",
            icon: <TrendingUp className="h-4 w-4" />,
            color: "#e07a5f",
          },
          {
            label: "Total Commits",
            value: stats.totalCommits,
            icon: <GitCommit className="h-4 w-4" />,
            color: "#81b29a",
          },
          {
            label: "Active Projects",
            value: stats.activeProjects,
            icon: <Layers className="h-4 w-4" />,
            color: "#f2cc8f",
          },
          {
            label: "Goals Done",
            value: stats.completedGoals,
            icon: <Target className="h-4 w-4" />,
            color: "#a8dadc",
          },
          {
            label: "Avg Energy",
            value: stats.avgEnergy,
            decimals: 1,
            suffix: "/5",
            icon: <Zap className="h-4 w-4" />,
            color: "#e9c46a",
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl bg-card border border-border animate-fade-in-up"
            style={{
              animationDelay: `${i * 80}ms`,
              boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)",
            }}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
            <AnimatedNumber
              value={stat.value}
              decimals={stat.decimals || 0}
              suffix={stat.suffix || ""}
              className="text-2xl font-display font-semibold text-foreground"
            />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap — 2 cols */}
        <div
          className="lg:col-span-2 p-5 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "400ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Activity Heatmap</h2>
          <HeatmapCalendar data={timelineData} />
        </div>

        {/* Radar — 1 col */}
        <div
          className="p-5 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "480ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <h2 className="font-display text-base font-semibold text-foreground mb-2">Domain Balance</h2>
          <RadarBalance data={timelineData} />
        </div>
      </div>

      {/* Narratives + Care & Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Narrative Engine */}
        <div
          className="p-5 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "560ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h2 className="font-display text-base font-semibold text-foreground">Observations</h2>
          </div>
          <div className="space-y-2.5">
            {narratives.map((n, i) => (
              <p
                key={i}
                className="text-sm text-muted-foreground leading-relaxed animate-fade-in-up"
                style={{ animationDelay: `${600 + i * 100}ms` }}
              >
                {n}
              </p>
            ))}
          </div>
        </div>

        {/* Care & Attention */}
        <div
          className="p-5 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "640ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="font-display text-base font-semibold text-foreground">Care & Attention</h2>
          </div>
          <div className="space-y-2.5">
            {gaps.slice(0, 5).map((g, i) => (
              <div
                key={g.domain}
                className="flex items-center gap-2 text-sm animate-fade-in-up"
                style={{ animationDelay: `${680 + i * 80}ms` }}
              >
                <DomainChip domain={g.domain} size="xs" />
                <span className="text-amber-400">
                  hasn't been tended in {g.gapDays}d
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-border mt-3">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Staleness Predictions
              </h3>
              {projects
                .filter((p) => p.state !== "archived")
                .map((p) => {
                  const daysLeft = predictStaleness(p, timelineData)
                  if (daysLeft === null || daysLeft > 10) return null
                  return (
                    <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                      <DomainChip domain={p.domain} size="xs" showLabel={false} />
                      <span className="text-foreground">{p.name}</span>
                      {daysLeft === 0 ? (
                        <span className="text-red-400 ml-auto flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Stale
                        </span>
                      ) : (
                        <span className="text-amber-400 ml-auto">~{daysLeft}d</span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Project cards with sparklines */}
      <div>
        <h2 className="font-display text-base font-semibold text-foreground mb-3">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project, i) => (
            <button
              key={project.id}
              onClick={() => setDetailPanel({ type: "project", id: project.id })}
              className={cn(
                "text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 animate-fade-in-up group"
              )}
              style={{
                animationDelay: `${720 + i * 60}ms`,
                boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)",
              }}
              type="button"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DOMAIN_COLORS[project.domain] }}
                  />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                </div>
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
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                {project.description}
              </p>
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{project.commitCount} commits</span>
                  <span className="font-mono">{project.staleDays}d ago</span>
                </div>
                <Sparkline
                  data={project.recentCommits.map((c) => c.count).reverse()}
                  width={64}
                  height={20}
                  color={DOMAIN_COLORS[project.domain]}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
