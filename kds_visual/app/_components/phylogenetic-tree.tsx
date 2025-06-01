"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockPhylogeneticData } from "@/lib/mock-data"

interface PhylogeneticTreeProps {
  speciesName?: string
}

export default function PhylogeneticTree({ speciesName = "" }: PhylogeneticTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!svgRef.current) return

    setIsLoading(true)

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height)

    // Add gradient definitions
    const defs = svg.append("defs")

    const gradient = defs.append("linearGradient").attr("id", "linkGradient").attr("gradientUnits", "userSpaceOnUse")

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.8)

    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#06b6d4").attr("stop-opacity", 0.6)

    // Create a group for the tree
    const g = svg.append("g").attr("transform", `translate(${width * 0.1}, ${height / 2})`)

    // Create a cluster layout
    const cluster = d3.cluster<{
      name: string
      children?: any[]
    }>().size([height * 0.8, width * 0.7])

   
    // Create a hierarchy from the data
    const root = d3.hierarchy<{
      name: string
      children?: any[]
    }>(mockPhylogeneticData)

    // Apply the cluster layout to the hierarchy
    cluster(root)

    // Create a custom link generator for the hierarchy
    const linkGenerator = d3
      .linkHorizontal<any, any>()
      .x((d: any) => d.y)
      .y((d: any) => d.x)

    // Create links with animation
    const links = g
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => linkGenerator(d))

    // Animate links
    links
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .attr("opacity", 1)

    // Create nodes
    const node = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .attr("opacity", 0)

    // Add circles to nodes with enhanced styling
    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d: any) => {
        if (speciesName && d.data.name.toLowerCase().includes(speciesName.toLowerCase())) {
          return "#ef4444"
        }
        return d.children ? "#10b981" : "#06b6d4"
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")

    // Add labels to leaf nodes
    node
      .filter((d: any) => !d.children)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", 12)
      .attr("text-anchor", "start")
      .text((d: any) => d.data.name)
      .attr("font-size", "11px")
      .attr("font-weight", (d: any) => {
        if (speciesName && d.data.name.toLowerCase().includes(speciesName.toLowerCase())) {
          return "bold"
        }
        return "normal"
      })
      .attr("fill", (d: any) => {
        if (speciesName && d.data.name.toLowerCase().includes(speciesName.toLowerCase())) {
          return "#ef4444"
        }
        return "#374151"
      })
      .attr("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))")

    // Animate nodes
    node
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("opacity", 1)

    node
      .select("circle")
      .transition()
      .duration(600)
      .delay((d, i) => i * 100 + 200)
      .attr("r", 6)

    // Create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom as any)

    setTimeout(() => setIsLoading(false), 1200)

    // Cleanup function
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove()
      }
    }
  }, [speciesName])

  const handleZoomIn = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.5, 5])
    svg
      .transition()
      .duration(300)
      .call((zoom as any).scaleBy, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.5, 5])
    svg
      .transition()
      .duration(300)
      .call((zoom as any).scaleBy, 0.7)
  }

  const handleReset = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.5, 5])
    svg
      .transition()
      .duration(500)
      .call((zoom as any).transform, d3.zoomIdentity)
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-sm z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <span className="ml-3 text-emerald-700 font-medium">Generating phylogenetic tree...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 right-4 flex space-x-2 z-10"
      >
        {[
          { icon: ZoomIn, action: handleZoomIn, tooltip: "Zoom In" },
          { icon: ZoomOut, action: handleZoomOut, tooltip: "Zoom Out" },
          { icon: RefreshCw, action: handleReset, tooltip: "Reset View" },
        ].map((btn, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={btn.action}
              className="bg-white/90 backdrop-blur-sm border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-lg"
              title={btn.tooltip}
            >
              <btn.icon className="h-4 w-4 text-emerald-600" />
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <svg ref={svgRef} className="w-full h-full cursor-move" style={{ touchAction: "none" }} />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-600 shadow-lg border border-emerald-200"
      >
        Zoom: {Math.round(zoomLevel * 100)}%
      </motion.div>
    </div>
  )
}
