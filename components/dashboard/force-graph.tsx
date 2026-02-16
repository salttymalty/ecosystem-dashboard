"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  DOMAIN_COLORS,
  projects,
  decisions,
  sessions,
} from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"

interface Node {
  id: string
  type: "project" | "decision" | "session"
  label: string
  color: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Link {
  source: string
  target: string
}

export function ForceGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const linksRef = useRef<Link[]>([])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const { activeDomain, setDetailPanel } = useDashboard()

  const buildGraph = useCallback(() => {
    const nodes: Node[] = []
    const links: Link[] = []

    projects.forEach((p) => {
      if (activeDomain && p.domain !== activeDomain) return
      nodes.push({
        id: p.id,
        type: "project",
        label: p.name,
        color: DOMAIN_COLORS[p.domain] || "#888",
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        vx: 0,
        vy: 0,
        radius: 12,
      })
    })

    decisions.forEach((d) => {
      const relevantProjects = d.projectIds.filter(
        (pid) => !activeDomain || projects.find((p) => p.id === pid)?.domain === activeDomain
      )
      if (activeDomain && relevantProjects.length === 0) return

      nodes.push({
        id: d.id,
        type: "decision",
        label: d.summary.slice(0, 30) + "...",
        color: "#f2cc8f",
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        vx: 0,
        vy: 0,
        radius: 7,
      })

      relevantProjects.forEach((pid) => {
        if (nodes.some((n) => n.id === pid)) {
          links.push({ source: d.id, target: pid })
        }
      })
    })

    sessions.slice(0, 15).forEach((s) => {
      if (activeDomain && s.domain !== activeDomain) return

      nodes.push({
        id: s.id,
        type: "session",
        label: s.summary.slice(0, 25) + "...",
        color: DOMAIN_COLORS[s.domain] || "#888",
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        vx: 0,
        vy: 0,
        radius: 5,
      })

      s.projectIds.forEach((pid) => {
        if (nodes.some((n) => n.id === pid)) {
          links.push({ source: s.id, target: pid })
        }
      })
    })

    nodesRef.current = nodes
    linksRef.current = links
  }, [activeDomain])

  useEffect(() => {
    buildGraph()
  }, [buildGraph])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const width = container.clientWidth
    const height = container.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const centerX = width / 2
    const centerY = height / 2

    function simulate() {
      const nodes = nodesRef.current
      const links = linksRef.current
      if (!ctx) return

      // Forces
      const alpha = 0.1

      // Centering force
      nodes.forEach((n) => {
        n.vx += (centerX - n.x) * 0.001
        n.vy += (centerY - n.y) * 0.001
      })

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const force = 800 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          nodes[i].vx -= fx
          nodes[i].vy -= fy
          nodes[j].vx += fx
          nodes[j].vy += fy
        }
      }

      // Link attraction
      links.forEach((l) => {
        const source = nodes.find((n) => n.id === l.source)
        const target = nodes.find((n) => n.id === l.target)
        if (!source || !target) return
        const dx = target.x - source.x
        const dy = target.y - source.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const force = (dist - 80) * 0.005
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      })

      // Apply velocity with damping
      nodes.forEach((n) => {
        n.vx *= 0.85
        n.vy *= 0.85
        n.x += n.vx * alpha
        n.y += n.vy * alpha
        // Bounds
        n.x = Math.max(20, Math.min(width - 20, n.x))
        n.y = Math.max(20, Math.min(height - 20, n.y))
      })

      // Draw
      ctx.clearRect(0, 0, width, height)

      // Links
      const isAnySelected = selectedNode || hoveredNode
      links.forEach((l) => {
        const source = nodes.find((n) => n.id === l.source)
        const target = nodes.find((n) => n.id === l.target)
        if (!source || !target) return

        const isConnected =
          isAnySelected &&
          (l.source === (selectedNode || hoveredNode) ||
            l.target === (selectedNode || hoveredNode))

        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.strokeStyle = isConnected
          ? "hsla(15, 70%, 55%, 0.5)"
          : isAnySelected
          ? "hsla(25, 10%, 30%, 0.1)"
          : "hsla(25, 10%, 30%, 0.25)"
        ctx.lineWidth = isConnected ? 2 : 0.5
        ctx.stroke()
      })

      // Nodes
      const connectedIds = new Set<string>()
      if (isAnySelected) {
        const activeId = selectedNode || hoveredNode
        links.forEach((l) => {
          if (l.source === activeId) connectedIds.add(l.target)
          if (l.target === activeId) connectedIds.add(l.source)
        })
        if (activeId) connectedIds.add(activeId)
      }

      nodes.forEach((n) => {
        const isHighlighted = !isAnySelected || connectedIds.has(n.id)
        const isHovered = n.id === hoveredNode
        const nodeAlpha = isHighlighted ? 1 : 0.15

        // Glow for hovered
        if (isHovered) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2)
          ctx.fillStyle = `${n.color}30`
          ctx.fill()
        }

        ctx.beginPath()
        if (n.type === "project") {
          // Circle for projects
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        } else if (n.type === "decision") {
          // Diamond for decisions
          ctx.moveTo(n.x, n.y - n.radius)
          ctx.lineTo(n.x + n.radius, n.y)
          ctx.lineTo(n.x, n.y + n.radius)
          ctx.lineTo(n.x - n.radius, n.y)
          ctx.closePath()
        } else {
          // Small circle for sessions
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        }

        ctx.fillStyle = n.color
        ctx.globalAlpha = nodeAlpha
        ctx.fill()

        // Label for projects
        if (n.type === "project") {
          ctx.font = "11px var(--font-body), system-ui"
          ctx.fillStyle = "hsl(30 15% 90%)"
          ctx.textAlign = "center"
          ctx.fillText(n.label, n.x, n.y + n.radius + 14)
        }

        ctx.globalAlpha = 1
      })

      animRef.current = requestAnimationFrame(simulate)
    }

    simulate()

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const found = nodesRef.current.find((n) => {
        const dx = n.x - mx
        const dy = n.y - my
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 4
      })

      setHoveredNode(found?.id || null)
      canvas.style.cursor = found ? "pointer" : "default"
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const found = nodesRef.current.find((n) => {
        const dx = n.x - mx
        const dy = n.y - my
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 4
      })

      if (found) {
        setSelectedNode((prev) => (prev === found.id ? null : found.id))
        setDetailPanel({ type: found.type, id: found.id })
      } else {
        setSelectedNode(null)
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("click", handleClick)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleClick)
    }
  }, [hoveredNode, selectedNode, activeDomain, buildGraph, setDetailPanel])

  return (
    <div ref={containerRef} className="w-full h-[400px] relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#e07a5f" }} />
          Projects
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rotate-45 rounded-sm" style={{ backgroundColor: "#f2cc8f" }} />
          Decisions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#a8dadc" }} />
          Sessions
        </span>
      </div>
    </div>
  )
}
