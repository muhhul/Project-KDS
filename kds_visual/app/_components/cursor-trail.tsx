"use client"

import { useRef, useEffect } from "react"

export default function CursorTrail() {
  const trailsRef = useRef<HTMLDivElement[]>([])
  const trailContainerRef = useRef<HTMLDivElement>(null)
  const mousePositionRef = useRef({ x: -100, y: -100 })
  const lastPositionRef = useRef({ x: -100, y: -100 })
  const trailCounterRef = useRef(0)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef(false)
  const animationFrameRef = useRef<number|undefined>(undefined)

  useEffect(() => {
    // Create trail elements
    const createTrailElements = () => {
      if (!trailContainerRef.current) return

      // Create 20 trail elements
      for (let i = 0; i < 20; i++) {
        const trailElement = document.createElement("div")
        trailElement.className = "cursor-trail-element"
        trailElement.style.cssText = `
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          pointer-events: none;
          z-index: 9997;
          mix-blend-mode: difference;
          opacity: 0;
          transform: translate3d(-100px, -100px, 0) scale(1);
          will-change: transform, opacity;
          transition: opacity 0.1s ease;
        `
        trailContainerRef.current.appendChild(trailElement)
        trailsRef.current.push(trailElement)
      }
    }

    createTrailElements()

    // Animation loop for trail fading
    const animateTrails = () => {
      trailsRef.current.forEach((trail, index) => {
        if (trail.style.opacity !== "0") {
          const currentOpacity = Number.parseFloat(trail.style.opacity) || 0
          const newOpacity = Math.max(0, currentOpacity - 0.05)
          trail.style.opacity = newOpacity.toString()

          // Scale down as it fades
          const scale = newOpacity
          const currentTransform = trail.style.transform
          const newTransform = currentTransform.replace(/scale$$[^)]*$$/, `scale(${scale})`)
          trail.style.transform = newTransform
        }
      })

      animationFrameRef.current = requestAnimationFrame(animateTrails)
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateTrails)

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
      isVisibleRef.current = true

      // Calculate distance moved
      const distance = Math.sqrt(
        Math.pow(mousePositionRef.current.x - lastPositionRef.current.x, 2) +
          Math.pow(mousePositionRef.current.y - lastPositionRef.current.y, 2),
      )

      // Only create trail if moved enough distance and not throttled
      if (distance > 15 && !throttleTimeoutRef.current && lastPositionRef.current.x !== -100) {
        createTrail(mousePositionRef.current.x, mousePositionRef.current.y)

        // Throttle trail creation
        throttleTimeoutRef.current = setTimeout(() => {
          throttleTimeoutRef.current = null
        }, 30)
      }

      lastPositionRef.current = mousePositionRef.current
    }

    const handleMouseLeave = () => {
      isVisibleRef.current = false
      lastPositionRef.current = { x: -100, y: -100 }
      // Fade out all trails
      trailsRef.current.forEach((trail) => {
        trail.style.opacity = "0"
      })
    }

    const handleMouseEnter = () => {
      isVisibleRef.current = true
    }

    // Handle when mouse leaves the document/window
    const handleDocumentMouseLeave = (e: MouseEvent) => {
      // Check if mouse is actually leaving the document
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        isVisibleRef.current = false
        lastPositionRef.current = { x: -100, y: -100 }
        // Fade out all trails
        trailsRef.current.forEach((trail) => {
          trail.style.opacity = "0"
        })
      }
    }

    // Handle visibility change (when switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false
        // Fade out all trails
        trailsRef.current.forEach((trail) => {
          trail.style.opacity = "0"
        })
      }
    }

    // Handle window focus/blur
    const handleWindowBlur = () => {
      isVisibleRef.current = false
      // Fade out all trails
      trailsRef.current.forEach((trail) => {
        trail.style.opacity = "0"
      })
    }

    const handleWindowFocus = () => {
      // Only show if mouse is within window bounds
      if (mousePositionRef.current.x >= 0 && mousePositionRef.current.y >= 0) {
        isVisibleRef.current = true
      }
    }

    // Create a trail at the specified position
    const createTrail = (x: number, y: number) => {
      const index = trailCounterRef.current % trailsRef.current.length
      const trail = trailsRef.current[index]

      if (trail && isVisibleRef.current) {
        // Position and show the trail
        trail.style.opacity = "0.6"
        trail.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0) scale(1)`
      }

      trailCounterRef.current++
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleDocumentMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    // Additional event listeners for better visibility control
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus)
    window.addEventListener("mouseleave", handleWindowBlur)
    window.addEventListener("mouseenter", handleWindowFocus)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleDocumentMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("focus", handleWindowFocus)
      window.removeEventListener("mouseleave", handleWindowBlur)
      window.removeEventListener("mouseenter", handleWindowFocus)
      if (throttleTimeoutRef.current) clearTimeout(throttleTimeoutRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return <div ref={trailContainerRef} className="pointer-events-none fixed inset-0 z-[9997]" />
}
