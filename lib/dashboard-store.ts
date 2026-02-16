"use client"

import { createContext, useContext } from "react"

export type ViewId = "overview" | "projects" | "decisions" | "goals" | "activity" | "timeline" | "graph"

export interface DashboardState {
  activeView: ViewId
  setActiveView: (view: ViewId) => void
  activeDomain: string | null
  setActiveDomain: (domain: string | null) => void
  dateRange: [Date, Date]
  setDateRange: (range: [Date, Date]) => void
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  detailPanel: { type: string; id: string } | null
  setDetailPanel: (panel: { type: string; id: string } | null) => void
  isDark: boolean
  setIsDark: (dark: boolean) => void
}

const now = new Date(2026, 1, 15)
const start = new Date(2026, 1, 15)
start.setDate(start.getDate() - 119)

export const defaultState: DashboardState = {
  activeView: "overview",
  setActiveView: () => {},
  activeDomain: null,
  setActiveDomain: () => {},
  dateRange: [start, now],
  setDateRange: () => {},
  commandOpen: false,
  setCommandOpen: () => {},
  detailPanel: null,
  setDetailPanel: () => {},
  isDark: true,
  setIsDark: () => {},
}

export const DashboardContext = createContext<DashboardState>(defaultState)

export function useDashboard() {
  return useContext(DashboardContext)
}
