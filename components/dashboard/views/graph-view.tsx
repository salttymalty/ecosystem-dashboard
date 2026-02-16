"use client"

import { useEcosystemData } from "@/lib/ecosystem-provider"
import { ForceGraph } from "../force-graph"

export function GraphView() {
  const { projects, decisions, sessions } = useEcosystemData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Knowledge Graph</h1>
        <p className="text-sm text-muted-foreground">Click nodes to explore connections</p>
      </div>

      <div
        className="rounded-xl bg-card border border-border overflow-hidden animate-fade-in-up"
        style={{ boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
      >
        <ForceGraph projects={projects} decisions={decisions} sessions={sessions} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div
          className="p-4 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "100ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <div className="text-2xl font-display font-semibold text-foreground">{projects.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Projects</div>
        </div>
        <div
          className="p-4 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "150ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <div className="text-2xl font-display font-semibold text-foreground">{decisions.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Decisions</div>
        </div>
        <div
          className="p-4 rounded-xl bg-card border border-border animate-fade-in-up"
          style={{ animationDelay: "200ms", boxShadow: "0 2px 8px hsla(25, 40%, 30%, 0.08)" }}
        >
          <div className="text-2xl font-display font-semibold text-foreground">{sessions.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Sessions</div>
        </div>
      </div>
    </div>
  )
}
