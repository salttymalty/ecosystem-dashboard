"use client"

import { useMemo } from "react"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { DomainChip } from "../domain-chip"
import { Clock, FileText, ChevronRight } from "lucide-react"

export function ActivityView() {
  const { activeDomain, setDetailPanel } = useDashboard()
  const { sessions, projects } = useEcosystemData()

  const filtered = useMemo(
    () => (activeDomain ? sessions.filter((s) => s.domain === activeDomain) : sessions),
    [activeDomain, sessions]
  )

  const totalDuration = useMemo(
    () => filtered.reduce((s, sess) => s + sess.duration, 0),
    [filtered]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Activity</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{filtered.length} sessions</span>
          <span>&middot;</span>
          <span>{totalDuration.toFixed(1)}h total</span>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((session, i) => (
          <button
            key={session.id}
            onClick={() => setDetailPanel({ type: "session", id: session.id })}
            className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 animate-fade-in-up group"
            style={{
              animationDelay: `${i * 40}ms`,
              boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)",
            }}
            type="button"
          >
            <div className="flex items-start gap-3">
              {/* Timeline dot */}
              <div
                className="mt-1.5 h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: DOMAIN_COLORS[session.domain] }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {session.summary}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{session.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.duration}h
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {session.artifacts.length} artifact{session.artifacts.length !== 1 && "s"}
                  </span>
                  <DomainChip domain={session.domain} size="xs" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
