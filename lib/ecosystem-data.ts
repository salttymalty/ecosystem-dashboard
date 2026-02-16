// ============================================================
// ECOSYSTEM INDEX — SAMPLE DATA
// ============================================================

export const DOMAIN_COLORS: Record<string, string> = {
  "mad-hudson": "#e07a5f",
  oeff: "#81b29a",
  ag: "#f2cc8f",
  meta: "#a8dadc",
  design: "#e9c46a",
  convene: "#f4a261",
  "red-0": "#e76f51",
  syzygy: "#9b5de5",
  drift: "#00bbf9",
}

export const DOMAIN_LABELS: Record<string, string> = {
  "mad-hudson": "Mad Hudson",
  oeff: "OEFF",
  ag: "Actors Garden",
  meta: "Meta / Infra",
  design: "Design",
  convene: "Convene",
  "red-0": "Red Zero",
  syzygy: "Syzygy",
  drift: "Drift",
}

export interface Project {
  id: string
  name: string
  domain: string
  description: string
  state: "active" | "paused" | "stale" | "archived"
  lastCommit: string
  commitCount: number
  staleDays: number
  recentCommits: { date: string; count: number }[]
}

export interface ProvenanceSession {
  id: string
  date: string
  domain: string
  duration: number
  artifacts: string[]
  summary: string
  projectIds: string[]
}

export interface Decision {
  id: string
  date: string
  summary: string
  tags: string[]
  projectIds: string[]
  rationale: string
}

export interface GoalMilestone {
  id: string
  title: string
  projectId: string
  status: "done" | "in-progress" | "blocked" | "planned"
  targetDate: string
  completedDate?: string
}

export interface EnergyLog {
  date: string
  energy: number
  focus: string
  dominantDomain: string
}

export interface TimelineRollup {
  date: string
  totalHours: number
  domains: Record<string, number>
  dominantDomain: string
}

// Generate realistic timeline data for the last 120 days
function generateTimeline(): TimelineRollup[] {
  const domains = Object.keys(DOMAIN_COLORS)
  const data: TimelineRollup[] = []
  const now = new Date(2026, 1, 15) // Feb 15, 2026

  for (let i = 119; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()

    // Lower hours on weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseHours = isWeekend ? Math.random() * 3 : 3 + Math.random() * 5
    const totalHours = Math.min(8, Math.round(baseHours * 10) / 10)

    // Distribute across domains with realistic clustering
    const domainHours: Record<string, number> = {}
    let remaining = totalHours

    // Pick 2-4 active domains per day with weighting
    const activeDomains = domains
      .filter(() => Math.random() > 0.5)
      .slice(0, Math.floor(2 + Math.random() * 3))

    if (activeDomains.length === 0) activeDomains.push("mad-hudson")

    // Weight toward mad-hudson and meta more heavily
    const weights: Record<string, number> = {
      "mad-hudson": 3 + Math.sin(i / 14) * 2,
      oeff: 1.5 + Math.cos(i / 20),
      ag: 1 + Math.sin(i / 10) * 0.5,
      meta: 2 + Math.cos(i / 7),
      design: 0.8 + Math.sin(i / 12) * 0.5,
      convene: 0.5 + Math.cos(i / 15) * 0.3,
      "red-0": 0.3 + Math.sin(i / 25) * 0.2,
      syzygy: 0.4 + Math.cos(i / 18) * 0.3,
      drift: 0.6 + Math.sin(i / 22) * 0.4,
    }

    const totalWeight = activeDomains.reduce((s, d) => s + (weights[d] || 1), 0)

    activeDomains.forEach((d, idx) => {
      if (idx === activeDomains.length - 1) {
        domainHours[d] = Math.round(remaining * 100) / 100
      } else {
        const share = (weights[d] || 1) / totalWeight
        const hours = Math.round(remaining * share * 100) / 100
        domainHours[d] = hours
        remaining -= hours
      }
    })

    const dominant = Object.entries(domainHours).sort((a, b) => b[1] - a[1])[0][0]

    data.push({ date: dateStr, totalHours, domains: domainHours, dominantDomain: dominant })
  }

  return data
}

function generateEnergyLogs(): EnergyLog[] {
  const logs: EnergyLog[] = []
  const now = new Date(2026, 1, 15)
  const focuses = [
    "Deep coding session",
    "Design iteration",
    "Writing and documentation",
    "Architecture planning",
    "Bug fixing marathon",
    "Creative exploration",
    "Refactoring sprint",
    "Feature prototyping",
    "Review and feedback",
    "System integration",
  ]
  const domains = Object.keys(DOMAIN_COLORS)

  for (let i = 59; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Energy tends to be higher mid-week, lower on weekends and Mondays
    let baseEnergy = 3
    if (dayOfWeek === 3 || dayOfWeek === 4) baseEnergy = 4
    if (isWeekend) baseEnergy = 2.5
    if (dayOfWeek === 1) baseEnergy = 2.5

    const energy = Math.max(1, Math.min(5, Math.round(baseEnergy + (Math.random() - 0.5) * 2)))

    logs.push({
      date: date.toISOString().split("T")[0],
      energy,
      focus: focuses[Math.floor(Math.random() * focuses.length)],
      dominantDomain: domains[Math.floor(Math.random() * domains.length)],
    })
  }

  return logs
}

export const projects: Project[] = [
  {
    id: "mad-hudson",
    name: "Mad Hudson",
    domain: "mad-hudson",
    description: "Interactive fiction engine with procedural narrative generation",
    state: "active",
    lastCommit: "2026-02-14",
    commitCount: 247,
    staleDays: 1,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: Math.floor(Math.random() * (i < 5 ? 8 : 4)),
    })),
  },
  {
    id: "oeff",
    name: "OEFF",
    domain: "oeff",
    description: "Open-ended form framework for adaptive questionnaires",
    state: "active",
    lastCommit: "2026-02-12",
    commitCount: 183,
    staleDays: 3,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: Math.floor(Math.random() * (i < 3 ? 5 : 3)),
    })),
  },
  {
    id: "ag",
    name: "Actors Garden",
    domain: "ag",
    description: "Actor-model microservice orchestrator with visual debugging",
    state: "paused",
    lastCommit: "2026-02-08",
    commitCount: 92,
    staleDays: 7,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: i > 7 ? Math.floor(Math.random() * 3) : 0,
    })),
  },
  {
    id: "meta-infra",
    name: "Meta / Infra",
    domain: "meta",
    description: "Shared tooling, CI/CD, and ecosystem orchestration layer",
    state: "active",
    lastCommit: "2026-02-15",
    commitCount: 312,
    staleDays: 0,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: Math.floor(Math.random() * 6),
    })),
  },
  {
    id: "design-sys",
    name: "Design System",
    domain: "design",
    description: "Unified component library and design tokens across all projects",
    state: "active",
    lastCommit: "2026-02-13",
    commitCount: 156,
    staleDays: 2,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: Math.floor(Math.random() * 4),
    })),
  },
  {
    id: "convene",
    name: "Convene",
    domain: "convene",
    description: "Real-time collaboration space with spatial audio",
    state: "stale",
    lastCommit: "2026-01-28",
    commitCount: 67,
    staleDays: 18,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: i > 18 ? Math.floor(Math.random() * 2) : 0,
    })),
  },
  {
    id: "red-0",
    name: "Red Zero",
    domain: "red-0",
    description: "Zero-latency edge computing framework for real-time apps",
    state: "paused",
    lastCommit: "2026-02-05",
    commitCount: 45,
    staleDays: 10,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: i > 10 ? Math.floor(Math.random() * 2) : 0,
    })),
  },
  {
    id: "syzygy",
    name: "Syzygy",
    domain: "syzygy",
    description: "Astronomical event tracker and celestial alignment calculator",
    state: "active",
    lastCommit: "2026-02-11",
    commitCount: 78,
    staleDays: 4,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: Math.floor(Math.random() * 3),
    })),
  },
  {
    id: "drift",
    name: "Drift",
    domain: "drift",
    description: "Ambient generative music engine driven by code patterns",
    state: "active",
    lastCommit: "2026-02-10",
    commitCount: 134,
    staleDays: 5,
    recentCommits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 1, 15 - i).toISOString().split("T")[0],
      count: Math.floor(Math.random() * 4),
    })),
  },
]

export const sessions: ProvenanceSession[] = Array.from({ length: 28 }, (_, i) => {
  const domains = Object.keys(DOMAIN_COLORS)
  const domain = domains[i % domains.length]
  const date = new Date(2026, 1, 15 - Math.floor(i * 1.5))
  const projectPool = projects.filter((p) => p.domain === domain || Math.random() > 0.7)
  return {
    id: `session-${i + 1}`,
    date: date.toISOString().split("T")[0],
    domain,
    duration: 0.5 + Math.round(Math.random() * 3.5 * 10) / 10,
    artifacts: [
      `${domain}-artifact-${i}-a.ts`,
      ...(Math.random() > 0.5 ? [`${domain}-artifact-${i}-b.md`] : []),
    ],
    summary: [
      "Refactored core routing logic and added edge-case handling",
      "Designed new component variants for the notification system",
      "Implemented streaming data pipeline with backpressure",
      "Wrote integration tests for the auth middleware",
      "Prototyped spatial audio positioning algorithm",
      "Migrated database schema and seeded test data",
      "Built custom animation system for page transitions",
      "Optimized bundle size by tree-shaking unused exports",
      "Created visual debugger for actor message passing",
      "Documented API surface and added OpenAPI schemas",
    ][i % 10],
    projectIds: projectPool.slice(0, 1 + Math.floor(Math.random() * 2)).map((p) => p.id),
  }
})

export const decisions: Decision[] = [
  { id: "d1", date: "2026-02-14", summary: "Adopted streaming SSR for all dynamic routes", tags: ["architecture", "performance"], projectIds: ["mad-hudson", "meta-infra"], rationale: "Reduces TTFB by 40% and enables progressive hydration" },
  { id: "d2", date: "2026-02-12", summary: "Switched to OKLCH color space for design tokens", tags: ["design", "accessibility"], projectIds: ["design-sys"], rationale: "Perceptually uniform gradients and better accessibility contrast checking" },
  { id: "d3", date: "2026-02-10", summary: "Moved to actor model for real-time collaboration", tags: ["architecture"], projectIds: ["convene", "ag"], rationale: "Decouples state management from transport layer" },
  { id: "d4", date: "2026-02-08", summary: "Standardized on Zod for all runtime validation", tags: ["dx", "safety"], projectIds: ["meta-infra", "oeff"], rationale: "Single source of truth for TypeScript types and runtime checks" },
  { id: "d5", date: "2026-02-06", summary: "Implemented edge caching with stale-while-revalidate", tags: ["performance", "infrastructure"], projectIds: ["red-0", "meta-infra"], rationale: "95th percentile latency dropped from 200ms to 45ms" },
  { id: "d6", date: "2026-02-04", summary: "Chose WebGPU over WebGL for celestial rendering", tags: ["technology", "performance"], projectIds: ["syzygy"], rationale: "Compute shaders enable real-time n-body simulation" },
  { id: "d7", date: "2026-02-02", summary: "Adopted Tone.js for audio synthesis pipeline", tags: ["technology"], projectIds: ["drift"], rationale: "Best Web Audio API abstraction with scheduling precision" },
  { id: "d8", date: "2026-01-30", summary: "Unified error boundary strategy across projects", tags: ["dx", "architecture"], projectIds: ["meta-infra", "mad-hudson", "oeff"], rationale: "Consistent error reporting and recovery UX" },
  { id: "d9", date: "2026-01-28", summary: "Deprecated REST in favor of tRPC for internal APIs", tags: ["architecture", "dx"], projectIds: ["meta-infra", "convene"], rationale: "End-to-end type safety without code generation" },
  { id: "d10", date: "2026-01-25", summary: "Introduced feature flags via edge config", tags: ["infrastructure", "dx"], projectIds: ["meta-infra"], rationale: "Zero-deploy feature rollouts with instant propagation" },
  { id: "d11", date: "2026-01-22", summary: "Migrated state management to Zustand", tags: ["architecture"], projectIds: ["mad-hudson", "convene"], rationale: "Simpler mental model than Redux, built-in devtools" },
  { id: "d12", date: "2026-01-20", summary: "Added questionnaire branching logic engine", tags: ["feature"], projectIds: ["oeff"], rationale: "Enables conditional paths based on previous responses" },
  { id: "d13", date: "2026-01-18", summary: "Set up monorepo with Turborepo", tags: ["infrastructure", "dx"], projectIds: ["meta-infra"], rationale: "Shared dependencies and cached builds across projects" },
  { id: "d14", date: "2026-01-15", summary: "Chose procedural narrative over scripted content", tags: ["design", "architecture"], projectIds: ["mad-hudson"], rationale: "Infinite replayability and emergent storytelling" },
  { id: "d15", date: "2026-01-12", summary: "Standardized on Vitest for all testing", tags: ["dx", "infrastructure"], projectIds: ["meta-infra"], rationale: "Vite-native, fast, and compatible with existing Jest tests" },
  { id: "d16", date: "2026-01-10", summary: "Implemented ambient music generation algorithm", tags: ["feature", "technology"], projectIds: ["drift"], rationale: "Uses Markov chains seeded by code complexity metrics" },
]

export const goals: GoalMilestone[] = [
  { id: "g1", title: "Mad Hudson alpha release", projectId: "mad-hudson", status: "in-progress", targetDate: "2026-03-01" },
  { id: "g2", title: "OEFF public beta", projectId: "oeff", status: "in-progress", targetDate: "2026-03-15" },
  { id: "g3", title: "Design system v2.0", projectId: "design-sys", status: "planned", targetDate: "2026-04-01" },
  { id: "g4", title: "Actors Garden demo video", projectId: "ag", status: "blocked", targetDate: "2026-02-28" },
  { id: "g5", title: "Meta CI/CD pipeline complete", projectId: "meta-infra", status: "done", targetDate: "2026-02-10", completedDate: "2026-02-08" },
  { id: "g6", title: "Convene spatial audio prototype", projectId: "convene", status: "blocked", targetDate: "2026-03-10" },
  { id: "g7", title: "Red Zero benchmarks published", projectId: "red-0", status: "planned", targetDate: "2026-03-20" },
  { id: "g8", title: "Syzygy eclipse predictor", projectId: "syzygy", status: "in-progress", targetDate: "2026-02-25" },
  { id: "g9", title: "Drift first album generated", projectId: "drift", status: "planned", targetDate: "2026-04-15" },
  { id: "g10", title: "OEFF accessibility audit", projectId: "oeff", status: "done", targetDate: "2026-01-30", completedDate: "2026-01-29" },
  { id: "g11", title: "Mad Hudson save system", projectId: "mad-hudson", status: "done", targetDate: "2026-01-20", completedDate: "2026-01-18" },
  { id: "g12", title: "Design tokens migration", projectId: "design-sys", status: "done", targetDate: "2026-02-01", completedDate: "2026-02-01" },
  { id: "g13", title: "Ecosystem dashboard v1", projectId: "meta-infra", status: "done", targetDate: "2026-02-05", completedDate: "2026-02-04" },
  { id: "g14", title: "Mad Hudson multiplayer", projectId: "mad-hudson", status: "planned", targetDate: "2026-05-01" },
  { id: "g15", title: "OEFF analytics pipeline", projectId: "oeff", status: "in-progress", targetDate: "2026-03-01" },
  { id: "g16", title: "Convene video integration", projectId: "convene", status: "planned", targetDate: "2026-04-01" },
  { id: "g17", title: "Syzygy mobile app", projectId: "syzygy", status: "planned", targetDate: "2026-05-15" },
  { id: "g18", title: "Meta observability stack", projectId: "meta-infra", status: "in-progress", targetDate: "2026-02-20" },
  { id: "g19", title: "Drift live performance mode", projectId: "drift", status: "planned", targetDate: "2026-06-01" },
  { id: "g20", title: "Red Zero serverless adapter", projectId: "red-0", status: "planned", targetDate: "2026-03-30" },
  { id: "g21", title: "Actors Garden k8s integration", projectId: "ag", status: "planned", targetDate: "2026-04-15" },
]

export const timelineData: TimelineRollup[] = generateTimeline()
export const energyLogs: EnergyLog[] = generateEnergyLogs()

// ============================================================
// NARRATIVE ENGINE
// ============================================================

export function generateNarratives(timeline: TimelineRollup[], energy: EnergyLog[]): string[] {
  const narratives: string[] = []
  const last7 = timeline.slice(-7)
  const prev7 = timeline.slice(-14, -7)

  // Domain comparison
  const last7Totals: Record<string, number> = {}
  const prev7Totals: Record<string, number> = {}

  last7.forEach((d) => {
    Object.entries(d.domains).forEach(([k, v]) => {
      last7Totals[k] = (last7Totals[k] || 0) + v
    })
  })
  prev7.forEach((d) => {
    Object.entries(d.domains).forEach(([k, v]) => {
      prev7Totals[k] = (prev7Totals[k] || 0) + v
    })
  })

  // Find biggest changes
  Object.keys(DOMAIN_LABELS).forEach((domain) => {
    const current = last7Totals[domain] || 0
    const previous = prev7Totals[domain] || 0
    if (previous > 0 && current / previous > 2) {
      narratives.push(
        `You spent ${(current / previous).toFixed(1)}x more time on ${DOMAIN_LABELS[domain]} this week than last.`
      )
    }
    if (previous > 2 && current < 0.5) {
      narratives.push(`${DOMAIN_LABELS[domain]} has gone quiet — only ${current.toFixed(1)}h this week vs ${previous.toFixed(1)}h last week.`)
    }
  })

  // Energy correlation
  const recentEnergy = energy.slice(-7)
  const avgEnergy = recentEnergy.reduce((s, e) => s + e.energy, 0) / recentEnergy.length
  const prevEnergy = energy.slice(-14, -7)
  const prevAvgEnergy = prevEnergy.length > 0 ? prevEnergy.reduce((s, e) => s + e.energy, 0) / prevEnergy.length : 3

  if (avgEnergy > prevAvgEnergy + 0.5) {
    narratives.push(`Energy is trending up — averaging ${avgEnergy.toFixed(1)} this week vs ${prevAvgEnergy.toFixed(1)} last week.`)
  } else if (avgEnergy < prevAvgEnergy - 0.5) {
    narratives.push(`Energy dipped to ${avgEnergy.toFixed(1)} this week from ${prevAvgEnergy.toFixed(1)} last week. Take it easy.`)
  }

  // Total hours
  const totalThisWeek = last7.reduce((s, d) => s + d.totalHours, 0)
  const totalLastWeek = prev7.reduce((s, d) => s + d.totalHours, 0)
  narratives.push(`Total output: ${totalThisWeek.toFixed(1)}h this week${totalLastWeek > 0 ? ` (${totalLastWeek > totalThisWeek ? "down" : "up"} from ${totalLastWeek.toFixed(1)}h)` : ""}.`)

  // Domain concentration
  const balance = computeDomainBalance(last7Totals)
  if (balance < 0.3) {
    narratives.push("Work is highly concentrated — consider spreading across projects.")
  } else if (balance > 0.7) {
    narratives.push("Work is well-distributed across domains this week.")
  }

  return narratives
}

export function computeDomainBalance(totals: Record<string, number>): number {
  const vals = Object.values(totals).filter((v) => v > 0)
  if (vals.length <= 1) return 0
  const total = vals.reduce((s, v) => s + v, 0)
  const proportions = vals.map((v) => v / total)
  const maxEntropy = Math.log(vals.length)
  const entropy = -proportions.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0)
  return maxEntropy > 0 ? entropy / maxEntropy : 0
}

export function detectStreaks(timeline: TimelineRollup[]): { domain: string; streak: number; type: "active" | "gap"; gapDays?: number }[] {
  const streaks: { domain: string; streak: number; type: "active" | "gap"; gapDays?: number }[] = []
  const domains = Object.keys(DOMAIN_LABELS)

  domains.forEach((domain) => {
    let currentStreak = 0
    let longestGap = 0
    let currentGap = 0

    // Count from most recent backwards
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].domains[domain] && timeline[i].domains[domain] > 0) {
        if (currentGap === 0) currentStreak++
        else break
        currentGap = 0
      } else {
        if (currentStreak > 0) break
        currentGap++
      }
    }

    // Find longest gap
    let tempGap = 0
    for (let i = 0; i < timeline.length; i++) {
      if (!timeline[i].domains[domain] || timeline[i].domains[domain] === 0) {
        tempGap++
        longestGap = Math.max(longestGap, tempGap)
      } else {
        tempGap = 0
      }
    }

    if (currentStreak >= 3) {
      streaks.push({ domain, streak: currentStreak, type: "active" })
    }
    if (longestGap >= 5) {
      streaks.push({ domain, streak: longestGap, type: "gap", gapDays: longestGap })
    }
  })

  return streaks.sort((a, b) => b.streak - a.streak)
}

export function predictStaleness(project: Project, timeline: TimelineRollup[]): number | null {
  const domain = project.domain
  const recent = timeline.slice(-30)
  const activeDays = recent.filter((d) => d.domains[domain] && d.domains[domain] > 0).length

  if (activeDays === 0) return 0
  const avgGapBetweenActive = 30 / activeDays
  const daysSinceLast = project.staleDays

  if (daysSinceLast >= avgGapBetweenActive * 2) return 0
  return Math.max(0, Math.round(avgGapBetweenActive * 2 - daysSinceLast))
}

// Search index
export interface SearchItem {
  type: "project" | "decision" | "session" | "goal"
  id: string
  title: string
  subtitle: string
  domain?: string
  date?: string
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = []

  projects.forEach((p) =>
    items.push({ type: "project", id: p.id, title: p.name, subtitle: p.description, domain: p.domain })
  )
  decisions.forEach((d) =>
    items.push({ type: "decision", id: d.id, title: d.summary, subtitle: d.tags.join(", "), date: d.date })
  )
  sessions.forEach((s) =>
    items.push({
      type: "session",
      id: s.id,
      title: s.summary,
      subtitle: `${s.duration}h on ${s.date}`,
      domain: s.domain,
      date: s.date,
    })
  )
  goals.forEach((g) =>
    items.push({
      type: "goal",
      id: g.id,
      title: g.title,
      subtitle: `${g.status} — ${g.targetDate}`,
    })
  )

  return items
}
