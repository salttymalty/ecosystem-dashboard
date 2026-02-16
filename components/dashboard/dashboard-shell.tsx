"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardContext, type ViewId, type DashboardState } from "@/lib/dashboard-store"
import { SidebarNav } from "./sidebar-nav"
import { CommandPalette } from "./command-palette"
import { DetailPanel } from "./detail-panel"
import { OverviewView } from "./views/overview-view"
import { ProjectsView } from "./views/projects-view"
import { DecisionsView } from "./views/decisions-view"
import { GoalsView } from "./views/goals-view"
import { ActivityView } from "./views/activity-view"
import { TimelineView } from "./views/timeline-view"
import { GraphView } from "./views/graph-view"
import { cn } from "@/lib/utils"

const VIEW_MAP: Record<ViewId, React.ComponentType> = {
  overview: OverviewView,
  projects: ProjectsView,
  decisions: DecisionsView,
  goals: GoalsView,
  activity: ActivityView,
  timeline: TimelineView,
  graph: GraphView,
}

export function DashboardShell() {
  const [activeView, setActiveView] = useState<ViewId>("overview")
  const [activeDomain, setActiveDomain] = useState<string | null>(null)

  const now = new Date(2026, 1, 15)
  const start = new Date(2026, 1, 15)
  start.setDate(start.getDate() - 119)

  const [dateRange, setDateRange] = useState<[Date, Date]>([start, now])
  const [commandOpen, setCommandOpen] = useState(false)
  const [detailPanel, setDetailPanel] = useState<{ type: string; id: string } | null>(null)
  const [isDark, setIsDark] = useState(true)

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      // Number keys 1-7 for views
      const viewKeys: ViewId[] = ["overview", "projects", "decisions", "goals", "activity", "timeline", "graph"]
      const num = parseInt(e.key)
      if (num >= 1 && num <= 7) {
        e.preventDefault()
        setActiveView(viewKeys[num - 1])
      }

      // Escape to close detail panel
      if (e.key === "Escape") {
        if (detailPanel) {
          setDetailPanel(null)
        } else if (activeDomain) {
          setActiveDomain(null)
        }
      }
    },
    [detailPanel, activeDomain]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const state: DashboardState = {
    activeView,
    setActiveView,
    activeDomain,
    setActiveDomain,
    dateRange,
    setDateRange,
    commandOpen,
    setCommandOpen,
    detailPanel,
    setDetailPanel,
    isDark,
    setIsDark,
  }

  const ActiveViewComponent = VIEW_MAP[activeView]

  return (
    <DashboardContext value={state}>
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <main
          className={cn(
            "flex-1 transition-all duration-300 lg:ml-64",
            detailPanel ? "lg:mr-80" : ""
          )}
        >
          <div className="px-6 py-6 lg:px-8 lg:py-8 max-w-[1400px]">
            {/* Active domain indicator */}
            {activeDomain && (
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in-up">
                <span>Filtered by domain:</span>
                <button
                  onClick={() => setActiveDomain(null)}
                  className="px-2 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                  type="button"
                >
                  {activeDomain} &times;
                </button>
              </div>
            )}

            <ActiveViewComponent />
          </div>
        </main>
        <DetailPanel />
        <CommandPalette />
      </div>
    </DashboardContext>
  )
}
