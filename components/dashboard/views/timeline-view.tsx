"use client"

import { Streamgraph } from "../streamgraph"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { AnimatedNumber } from "../animated-number"
import { useMemo } from "react"

export function TimelineView() {
  const { activeDomain } = useDashboard()
  const { timelineData } = useEcosystemData()

  const stats = useMemo(() => {
    const last30 = timelineData.slice(-30)
    const totalHours = last30.reduce((s, d) => s + d.totalHours, 0)
    const avgDaily = totalHours / 30

    const domainTotals: Record<string, number> = {}
    last30.forEach((d) => {
      Object.entries(d.domains).forEach(([k, v]) => {
        domainTotals[k] = (domainTotals[k] || 0) + v
      })
    })

    const sorted = Object.entries(domainTotals).sort((a, b) => b[1] - a[1])
    return { totalHours, avgDaily, domainTotals, sorted }
  }, [timelineData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Timeline</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <AnimatedNumber value={stats.totalHours} decimals={1} className="font-mono text-foreground" />
            {"h total (30d)"}
          </span>
          <span>
            <AnimatedNumber value={stats.avgDaily} decimals={1} className="font-mono text-foreground" />
            {"h/day avg"}
          </span>
        </div>
      </div>

      {/* Streamgraph */}
      <div
        className="p-5 rounded-xl bg-card border border-border animate-fade-in-up"
        style={{ boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
      >
        <h2 className="font-display text-base font-semibold text-foreground mb-3">Domain River</h2>
        <Streamgraph data={timelineData} />
      </div>

      {/* Domain breakdown */}
      <div
        className="p-5 rounded-xl bg-card border border-border animate-fade-in-up"
        style={{ animationDelay: "100ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
      >
        <h2 className="font-display text-base font-semibold text-foreground mb-4">Domain Breakdown (30d)</h2>
        <div className="space-y-3">
          {stats.sorted.map(([domain, hours], i) => {
            const maxHours = stats.sorted[0][1]
            const pct = (hours / maxHours) * 100
            const color = DOMAIN_COLORS[domain] || "#888"
            const label = DOMAIN_LABELS[domain] || domain
            const isFiltered = activeDomain && activeDomain !== domain

            return (
              <div
                key={domain}
                className="flex items-center gap-3 animate-fade-in-up"
                style={{
                  animationDelay: `${150 + i * 50}ms`,
                  opacity: isFiltered ? 0.3 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <span className="text-xs text-muted-foreground w-24 truncate">{label}</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(25 10% 14%)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                  {hours.toFixed(1)}h
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
