"use client"

import { cn } from "@/lib/utils"
import { useDashboard, type ViewId } from "@/lib/dashboard-store"
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/ecosystem-data"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import { DomainChip } from "./domain-chip"
import {
  LayoutDashboard,
  Layers,
  GitBranch,
  Target,
  Zap,
  Calendar,
  Network,
  Search,
  Sun,
  Moon,
  X,
  Menu,
} from "lucide-react"
import { useState, useMemo } from "react"

const NAV_ITEMS: { id: ViewId; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, shortcut: "1" },
  { id: "projects", label: "Projects", icon: <Layers className="h-4 w-4" />, shortcut: "2" },
  { id: "decisions", label: "Decisions", icon: <GitBranch className="h-4 w-4" />, shortcut: "3" },
  { id: "goals", label: "Goals", icon: <Target className="h-4 w-4" />, shortcut: "4" },
  { id: "activity", label: "Activity", icon: <Zap className="h-4 w-4" />, shortcut: "5" },
  { id: "timeline", label: "Timeline", icon: <Calendar className="h-4 w-4" />, shortcut: "6" },
  { id: "graph", label: "Graph", icon: <Network className="h-4 w-4" />, shortcut: "7" },
]

export function SidebarNav() {
  const {
    activeView,
    setActiveView,
    activeDomain,
    setActiveDomain,
    setCommandOpen,
    isDark,
    setIsDark,
  } = useDashboard()

  const { projects } = useEcosystemData()

  const activeDomains = useMemo(() => {
    const domainSet = new Set(projects.map((p) => p.domain))
    return Object.keys(DOMAIN_COLORS).filter((d) => domainSet.has(d))
  }, [projects])

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-3 left-3 z-50 p-2.5 rounded-lg bg-card text-card-foreground border border-border lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
        type="button"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay on mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-card border-r border-border transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-border">
          <h1 className="font-display text-lg font-semibold text-foreground tracking-tight">
            Ecosystem
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {projects.length} projects, one nervous system
          </p>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground bg-accent/50 hover:bg-accent transition-colors"
          type="button"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {"/"}</kbd>
        </button>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                activeView === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
              <kbd className="ml-auto text-xs font-mono text-muted-foreground opacity-50">
                {item.shortcut}
              </kbd>
            </button>
          ))}
        </nav>

        {/* Domain filters */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Domains
            </span>
            {activeDomain && (
              <button
                onClick={() => setActiveDomain(null)}
                className="text-xs text-primary hover:underline"
                type="button"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeDomains.map((domain) => (
              <DomainChip key={domain} domain={domain} size="xs" />
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <div className="px-4 py-3 border-t border-border">
          <button
            onClick={() => {
              setIsDark(!isDark)
              document.documentElement.classList.toggle("dark")
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
