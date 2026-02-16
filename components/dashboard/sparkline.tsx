"use client"

import { useEffect, useRef } from "react"

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "#e07a5f",
  fill = true,
  strokeWidth = 1.5,
  className = "",
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
  strokeWidth?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const max = Math.max(...data, 1)
    const padding = 2
    const drawW = width - padding * 2
    const drawH = height - padding * 2

    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * drawW,
      y: padding + drawH - (v / max) * drawH,
    }))

    // Fill area
    if (fill) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, height - padding)
      points.forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, height - padding)
      ctx.closePath()
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, `${color}30`)
      grad.addColorStop(1, `${color}05`)
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Stroke line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, cx, (points[i - 1].y + points[i].y) / 2)
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.lineCap = "round"
    ctx.stroke()

    // End dot
    const last = points[points.length - 1]
    ctx.beginPath()
    ctx.arc(last.x, last.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }, [data, width, height, color, fill, strokeWidth])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
    />
  )
}
