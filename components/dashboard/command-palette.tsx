"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DOMAIN_COLORS, type SearchItem } from "@/lib/ecosystem-data"
import { useEcosystemData } from "@/lib/ecosystem-provider"
import { useDashboard, type ViewId } from "@/lib/dashboard-store"
import {
  Layers,
  GitBranch,
  Target,
  Zap,
  LayoutDashboard,
  Calendar,
  Activity,
  Network,
} from "lucide-react"

const VIEW_ITEMS: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "projects", label: "Projects", icon: <Layers className="h-4 w-4" /> },
  { id: "decisions", label: "Decisions", icon: <GitBranch className="h-4 w-4" /> },
  { id: "goals", label: "Goals", icon: <Target className="h-4 w-4" /> },
  { id: "activity", label: "Activity", icon: <Zap className="h-4 w-4" /> },
  { id: "timeline", label: "Timeline", icon: <Calendar className="h-4 w-4" /> },
  { id: "graph", label: "Graph", icon: <Network className="h-4 w-4" /> },
]

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setActiveView, setDetailPanel, setActiveDomain } = useDashboard()
  const { searchIndex } = useEcosystemData()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInputFocused())) {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setCommandOpen])

  function isInputFocused() {
    const active = document.activeElement
    return active?.tagName === "INPUT" || active?.tagName === "TEXTAREA"
  }

  const getIcon = (type: SearchItem["type"]) => {
    switch (type) {
      case "project":
        return <Layers className="h-4 w-4 text-muted-foreground" />
      case "decision":
        return <GitBranch className="h-4 w-4 text-muted-foreground" />
      case "session":
        return <Activity className="h-4 w-4 text-muted-foreground" />
      case "goal":
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Search everything... (projects, decisions, goals, sessions)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Views">
          {VIEW_ITEMS.map((v) => (
            <CommandItem
              key={v.id}
              onSelect={() => {
                setActiveView(v.id)
                setCommandOpen(false)
              }}
            >
              {v.icon}
              <span>{v.label}</span>
              <span className="ml-auto text-xs text-muted-foreground font-mono">
                {VIEW_ITEMS.indexOf(v) + 1}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Domains">
          {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
            <CommandItem
              key={domain}
              onSelect={() => {
                setActiveDomain(domain)
                setCommandOpen(false)
              }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{domain.replace("-", " ")}</span>
            </CommandItem>
          ))}
          <CommandItem
            onSelect={() => {
              setActiveDomain(null)
              setCommandOpen(false)
            }}
          >
            <span className="h-3 w-3 rounded-full bg-muted" />
            <span>Clear domain filter</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Items">
          {searchIndex.slice(0, 20).map((item) => (
            <CommandItem
              key={`${item.type}-${item.id}`}
              onSelect={() => {
                setDetailPanel({ type: item.type, id: item.id })
                if (item.type === "project") setActiveView("projects")
                else if (item.type === "decision") setActiveView("decisions")
                else if (item.type === "goal") setActiveView("goals")
                else setActiveView("activity")
                setCommandOpen(false)
              }}
            >
              {getIcon(item.type)}
              <div className="flex flex-col">
                <span className="text-sm">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
