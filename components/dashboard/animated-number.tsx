"use client"

import { useEffect, useRef, useState } from "react"

export function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const startTime = useRef<number | null>(null)
  const startValue = useRef(0)

  useEffect(() => {
    startValue.current = display
    startTime.current = null

    function step(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = startValue.current + (value - startValue.current) * eased
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
