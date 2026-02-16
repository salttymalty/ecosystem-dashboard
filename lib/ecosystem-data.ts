// ============================================================
// ECOSYSTEM INDEX — REAL DATA ADAPTER
// ============================================================
// Loads real ecosystem-index.json and transforms it into
// the shapes expected by dashboard views.
// ============================================================

// === Domain colors — canonical palette ===
export const DOMAIN_COLORS: Record<string, string> = {
  oeff: "#5c7c6b",
  convene: "#4b7c8c",
  ag: "#b8864b",
  "mad-hudson": "#a0644b",
  "taylor-hopkins": "#c4704b",
  design: "#e9c46a",
  meta: "#a8dadc",
  personal: "#d4c8b8",
  "audio-archive": "#8b6b5b",
  "cross-domain": "#9ca3af",
}

export const DOMAIN_LABELS: Record<string, string> = {
  oeff: "OEFF",
  convene: "Convene",
  ag: "Actors Garden",
  "mad-hudson": "Mad Hudson",
  "taylor-hopkins": "Taylor Art",
  design: "Design",
  meta: "Meta / Infra",
  personal: "Personal OS",
  "audio-archive": "Audio Archive",
  "cross-domain": "Cross-domain",
}

// === TypeScript interfaces — dashboard shapes ===

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
  nextAction?: string
  blockers?: string[]
  openQuestions?: string[]
  path?: string
}

export interface ProvenanceSession {
  id: string
  date: string
  domain: string
  duration: number
  artifacts: string[]
  summary: string
  projectIds: string[]
  tags?: string[]
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
  dependencies?: string
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

export interface BlockedItem {
  project: string
  blocker: string
}

export interface OpenQuestion {
  project: string
  question: string
}

export interface WeeklyReview {
  week: string
  period: string
  summary: string
}

export interface CorpusStats {
  total: number
  byDomain: Record<string, number>
}

export interface SearchItem {
  type: "project" | "decision" | "session" | "goal"
  id: string
  title: string
  subtitle: string
  domain?: string
  date?: string
}

// === Raw JSON schema (what the file actually looks like) ===

interface RawProject {
  id: string
  name: string
  path: string
  domain: string
  exists: boolean
  is_git_repo: boolean
  state_summary: {
    last_updated: string
    working_on: string
    blockers: string[]
    next_action: string
    open_questions: string[]
  }
  last_activity: string
  staleness_days: number
  recent_commits: { hash: string; date: string; message: string }[]
}

interface RawDecision {
  file: string
  slug: string
  date: string
  title: string
  project: string
  tags: string[]
  summary: string
}

interface RawSession {
  file: string
  id: string
  domain: string
  started: string
  intent: string
  tags: string[]
  artifacts_created: string[]
  artifacts_modified: string[]
  decisions: string[]
  date: string
}

interface RawGoal {
  project: string
  milestone: string
  target_date: string
  status: string
  dependencies: string
}

interface RawEnergyEntry {
  date: string
  energy?: number
  focus?: string
  type?: string
}

interface RawTimeline {
  dailyRollups: TimelineRollup[]
  dateRange: { start: string; end: string }
  totalDays: number
  activeDays: number
}

interface RawSearchItem {
  type: string
  id: string
  label: string
  text: string
  date?: string
}

interface RawEcosystemIndex {
  _meta: { generated: string; generator: string; staleness_threshold_days: number }
  projects: RawProject[]
  decisions: RawDecision[]
  sessions: RawSession[]
  energy: { entries: RawEnergyEntry[]; recent: RawEnergyEntry[]; average_recent: number }
  weekly_reviews: { file: string; week: string; period: string; summary: string }[]
  goals: { milestones: RawGoal[]; upcoming: RawGoal[] }
  corpus: { total: number; by_domain: Record<string, number> }
  stale: unknown[]
  recent: { decisions: unknown[]; sessions: unknown[]; commits: unknown[]; domain_activity: unknown }
  blocked: { project: string; blocker: string }[]
  open_questions: { project: string; question: string }[]
  search: RawSearchItem[]
  timeline: RawTimeline
}

// === Adapter functions ===

function deriveState(staleDays: number): "active" | "paused" | "stale" {
  if (staleDays > 14) return "stale"
  if (staleDays > 7) return "paused"
  return "active"
}

function aggregateCommitsByDate(commits: { date: string }[]): { date: string; count: number }[] {
  const counts: Record<string, number> = {}
  commits.forEach((c) => {
    counts[c.date] = (counts[c.date] || 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

function estimateDuration(artifactCount: number): number {
  if (artifactCount === 0) return 1
  if (artifactCount <= 2) return 1.5
  if (artifactCount <= 5) return 2.5
  return 4
}

function mapGoalStatus(raw: string): "done" | "in-progress" | "blocked" | "planned" {
  const lower = raw.toLowerCase()
  if (lower === "complete" || lower === "done") return "done"
  if (lower === "in progress") return "in-progress"
  if (lower === "blocked") return "blocked"
  if (lower === "seeded" || lower === "ready") return "in-progress"
  if (lower === "\u2014") return "planned"
  return "planned"
}

function findProjectIdByName(name: string, projects: RawProject[]): string {
  const exact = projects.find((p) => p.name === name)
  if (exact) return exact.id

  const partial = projects.find((p) =>
    name.toLowerCase().includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(p.id.toLowerCase())
  )
  if (partial) return partial.id

  const nameMap: Record<string, string> = {
    "OEFF 2026": "oeff",
    "Taylor Hopkins Art": "taylor",
    "Personal OS": "personal-os",
    "Warm Stack": "warm-stack",
    "Actors Garden": "ag",
    "Actors-Garden": "ag",
    "Mad Hudson SEO": "mad-hudson",
  }
  return nameMap[name] || name.toLowerCase().replace(/\s+/g, "-")
}

// === Transform the full index ===

export function transformEcosystemData(raw: RawEcosystemIndex) {
  const projects: Project[] = raw.projects.map((p) => ({
    id: p.id,
    name: p.name,
    domain: p.domain,
    description: p.state_summary.working_on || "No current focus",
    state: deriveState(p.staleness_days),
    lastCommit: p.last_activity,
    commitCount: p.recent_commits.length,
    staleDays: p.staleness_days,
    recentCommits: aggregateCommitsByDate(p.recent_commits),
    nextAction: p.state_summary.next_action,
    blockers: p.state_summary.blockers,
    openQuestions: p.state_summary.open_questions,
    path: p.path,
  }))

  const decisions: Decision[] = raw.decisions.map((d) => ({
    id: d.slug,
    date: d.date,
    summary: d.title,
    tags: d.tags,
    projectIds: [d.project].filter(Boolean),
    rationale: d.summary || "",
  }))

  const sessions: ProvenanceSession[] = raw.sessions.map((s) => {
    const allArtifacts = [...(s.artifacts_created || []), ...(s.artifacts_modified || [])]
    return {
      id: s.id,
      date: s.date,
      domain: s.domain,
      duration: estimateDuration(allArtifacts.length),
      artifacts: allArtifacts,
      summary: s.intent,
      projectIds: [],
      tags: s.tags,
    }
  })

  const goals: GoalMilestone[] = raw.goals.milestones.map((g, i) => ({
    id: `goal-${i}`,
    title: g.milestone,
    projectId: findProjectIdByName(g.project, raw.projects),
    status: mapGoalStatus(g.status),
    targetDate: g.target_date,
    dependencies: g.dependencies,
  }))

  const energyLogs: EnergyLog[] = raw.energy.entries
    .filter((e) => typeof e.energy === "number")
    .map((e) => ({
      date: e.date,
      energy: e.energy!,
      focus: e.focus || "",
      dominantDomain: "",
    }))

  const timelineData: TimelineRollup[] = raw.timeline.dailyRollups

  const blocked: BlockedItem[] = raw.blocked
  const openQuestions: OpenQuestion[] = raw.open_questions

  const weeklyReviews: WeeklyReview[] = raw.weekly_reviews.map((r) => ({
    week: r.week,
    period: r.period,
    summary: r.summary,
  }))

  const corpus: CorpusStats = {
    total: raw.corpus.total,
    byDomain: raw.corpus.by_domain,
  }

  const searchIndex: SearchItem[] = raw.search.map((s) => ({
    type: s.type as SearchItem["type"],
    id: s.id,
    title: s.label,
    subtitle: s.text,
    date: s.date,
  }))

  return {
    projects,
    decisions,
    sessions,
    goals,
    energyLogs,
    timelineData,
    blocked,
    openQuestions,
    weeklyReviews,
    corpus,
    searchIndex,
    meta: raw._meta,
  }
}

export type EcosystemData = ReturnType<typeof transformEcosystemData>

// ============================================================
// NARRATIVE ENGINE
// ============================================================

export function generateNarratives(timeline: TimelineRollup[], energy: EnergyLog[]): string[] {
  const narratives: string[] = []

  if (timeline.length < 2) {
    narratives.push(`${timeline.length} day${timeline.length !== 1 ? "s" : ""} of activity data so far — the picture fills in over time.`)
    return narratives
  }

  const midpoint = Math.floor(timeline.length / 2)
  const firstHalf = timeline.slice(0, midpoint)
  const secondHalf = timeline.slice(midpoint)

  const firstTotals: Record<string, number> = {}
  const secondTotals: Record<string, number> = {}

  firstHalf.forEach((d) => {
    Object.entries(d.domains).forEach(([k, v]) => {
      firstTotals[k] = (firstTotals[k] || 0) + v
    })
  })
  secondHalf.forEach((d) => {
    Object.entries(d.domains).forEach(([k, v]) => {
      secondTotals[k] = (secondTotals[k] || 0) + v
    })
  })

  Object.keys(DOMAIN_LABELS).forEach((domain) => {
    const current = secondTotals[domain] || 0
    const previous = firstTotals[domain] || 0
    if (previous > 0 && current / previous > 2) {
      narratives.push(
        `${DOMAIN_LABELS[domain]} saw ${(current / previous).toFixed(1)}x more activity recently.`
      )
    }
    if (previous > 1 && current < 0.5) {
      narratives.push(
        `${DOMAIN_LABELS[domain]} hasn't been tended recently — ${current.toFixed(1)}h vs ${previous.toFixed(1)}h earlier.`
      )
    }
  })

  if (energy.length >= 2) {
    const avgEnergy = energy.reduce((s, e) => s + e.energy, 0) / energy.length
    narratives.push(`Average energy: ${avgEnergy.toFixed(1)}/5 across ${energy.length} check-ins.`)
  }

  const totalHours = timeline.reduce((s, d) => s + d.totalHours, 0)
  narratives.push(`${totalHours.toFixed(1)}h tracked across ${timeline.length} days.`)

  const allTotals: Record<string, number> = {}
  timeline.forEach((d) => {
    Object.entries(d.domains).forEach(([k, v]) => {
      allTotals[k] = (allTotals[k] || 0) + v
    })
  })
  const balance = computeDomainBalance(allTotals)
  if (balance < 0.3) {
    narratives.push("Work is highly concentrated in a few domains.")
  } else if (balance > 0.7) {
    narratives.push("Work is well-distributed across domains.")
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

export function detectDomainGaps(timeline: TimelineRollup[]): { domain: string; gapDays: number }[] {
  const gaps: { domain: string; gapDays: number }[] = []
  const domains = Object.keys(DOMAIN_LABELS)

  domains.forEach((domain) => {
    let daysSinceLast = 0
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].domains[domain] && timeline[i].domains[domain] > 0) break
      daysSinceLast++
    }

    if (daysSinceLast >= 3 && daysSinceLast < timeline.length) {
      gaps.push({ domain, gapDays: daysSinceLast })
    }
  })

  return gaps.sort((a, b) => b.gapDays - a.gapDays)
}

export function predictStaleness(project: Project, timeline: TimelineRollup[]): number | null {
  const domain = project.domain
  const activeDays = timeline.filter((d) => d.domains[domain] && d.domains[domain] > 0).length

  if (activeDays === 0) return 0
  const avgGapBetweenActive = timeline.length / activeDays
  const daysSinceLast = project.staleDays

  if (daysSinceLast >= avgGapBetweenActive * 2) return 0
  return Math.max(0, Math.round(avgGapBetweenActive * 2 - daysSinceLast))
}
