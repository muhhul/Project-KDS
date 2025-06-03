"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import phylogeneticDataFromFile from "@/public/phylogenetic.json" 
import { Button } from "@/components/ui/button" 

interface TreeNode {
  name: string;
  children?: TreeNode[];
  branch_length?: number;
}

interface PhylogeneticTreeProps {
  speciesName?: string 
}

const DESIRED_LEAF_SEPARATION = 30; 
const BRANCH_LENGTH_STRETCH_FACTOR = 4; 

const ANIM_DURATION_FAST = 500; 
const ANIM_DURATION_NORMAL = 400; 
const ANIM_DURATION_SHORT = 300; 
const ANIM_LINK_DELAY_FACTOR = 15; 
const ANIM_NODE_DELAY_FACTOR = 30; 
const ANIM_CIRCLE_EXTRA_DELAY = 50; 

const HIGHLIGHT_COLOR_TARGET = "#ef4444"; 
const HIGHLIGHT_COLOR_PATH = "#FAAC18";   

function transformNodeNamesRecursive(node: any) {
  if (node && typeof node.name === 'string') {
    node.name = node.name.replace(/_/g, ' ');
  }
  if (node && node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      transformNodeNamesRecursive(child);
    }
  }
}

export default function PhylogeneticTree({ speciesName = "" }: PhylogeneticTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const treeGroupRef = useRef<SVGGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !phylogeneticDataFromFile) return;

    setIsLoading(true);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const processedData = JSON.parse(JSON.stringify(phylogeneticDataFromFile));
    
    if (typeof processedData.name === 'string') {
        processedData.name = processedData.name.replace(/_/g, ' ');
    }
    if (processedData.tree && processedData.tree.children && Array.isArray(processedData.tree.children)) {
        processedData.tree.children.forEach((branchContainer: any) => {
            if (branchContainer.children && Array.isArray(branchContainer.children)) {
                branchContainer.children.forEach((actualNamedNode: any) => {
                    transformNodeNamesRecursive(actualNamedNode);
                });
            }
        });
    }

    const speciesNameToMatch = speciesName.toLowerCase();


    const mergedRootData: TreeNode = {
      name: processedData.name, 
      children: [], 
      branch_length: processedData.tree.branch_length, 
    };

    function findOrCreateChild(parentNode: TreeNode, childDataToMerge: any): TreeNode {
      const childName = childDataToMerge.name;
      if (typeof childName !== 'string') {
        console.warn("Node without a valid name encountered during merge:", childDataToMerge);
        childDataToMerge.name = "Unnamed Node " + Math.random().toString(36).substr(2, 5);
      }

      if (!parentNode.children) {
        parentNode.children = [];
      }
      let foundChild = parentNode.children.find(c => c.name === childDataToMerge.name);
      
      if (!foundChild) {
        foundChild = {
          name: childDataToMerge.name,
          branch_length: childDataToMerge.branch_length,
          children: [], 
        };
        parentNode.children.push(foundChild);
      } else {
        if (childDataToMerge.branch_length !== undefined && foundChild.branch_length === undefined) {
            foundChild.branch_length = childDataToMerge.branch_length;
        }
      }
      return foundChild;
    }

    function recursivelyMergeChildren(currentMergedParentNode: TreeNode, childrenToMergeFromJSON: any[] | undefined) {
      if (!childrenToMergeFromJSON || childrenToMergeFromJSON.length === 0) {
        return;
      }
      childrenToMergeFromJSON.forEach(childJsonNode => {
        if (typeof childJsonNode !== 'object' || childJsonNode === null) {
            console.warn("Invalid child node data encountered in JSON for merging:", childJsonNode);
            return;
        }
        const newOrExistingMergedChild = findOrCreateChild(currentMergedParentNode, childJsonNode);
        recursivelyMergeChildren(newOrExistingMergedChild, childJsonNode.children);
      });
    }

    processedData.tree.children.forEach((unnamedBranchContainer: any) => {
      if (unnamedBranchContainer.children && unnamedBranchContainer.children.length > 0) {
        recursivelyMergeChildren(mergedRootData, unnamedBranchContainer.children);
      }
    });

    const updateTree = (dataForHierarchy: TreeNode) => { 
      if (!svgRef.current || !containerRef.current) return;

      const currentSvg = d3.select(svgRef.current);
      currentSvg.selectAll("*").remove(); 

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      currentSvg.attr("width", width).attr("height", height);

      const isSmallScreen = width < 640;
      const margin = { 
        left: width * (isSmallScreen ? 0.08 : 0.1), 
        top: height * 0.05, 
        right: width * (isSmallScreen ? 0.15 : 0.2) 
      };
      const nodeRadius = isSmallScreen ? 4 : 6;
      const fontSize = isSmallScreen ? 9 : 11;

      const defs = currentSvg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "linkGradient")
        .attr("gradientUnits", "userSpaceOnUse");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.8);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#06b6d4").attr("stop-opacity", 0.6);


      const zoomableGroup = currentSvg.append("g").attr("class", "zoomable-group");
      treeGroupRef.current = zoomableGroup.node() as SVGGElement;
      
      const root = d3.hierarchy<TreeNode>(dataForHierarchy, d => d.children);
      
      const numLeaves = root.leaves().length;
      const minViewportBasedHeight = height - margin.top * 2; 
      const calculatedTreeHeight = numLeaves * DESIRED_LEAF_SEPARATION;
      const dynamicClusterHeight = Math.max(minViewportBasedHeight, calculatedTreeHeight);
      
      const baseClusterWidth = width - margin.left - margin.right;
      const dynamicClusterWidth = baseClusterWidth * BRANCH_LENGTH_STRETCH_FACTOR;

      const cluster = d3.cluster<TreeNode>().size([dynamicClusterHeight, dynamicClusterWidth]);
      cluster(root);

      let targetNodeForPath: d3.HierarchyNode<TreeNode> | null = null;
      if (speciesNameToMatch) {
        root.each((node: d3.HierarchyNode<TreeNode>) => { 
          if (!targetNodeForPath && node.data.name && node.data.name.toLowerCase() === speciesNameToMatch) {
            targetNodeForPath = node;
          }
        });
      }

      const ancestorsSet = new Set<string>();
      if (targetNodeForPath !== null) { 
        (targetNodeForPath as d3.HierarchyNode<TreeNode>).ancestors().forEach(anc => {
            if (anc.data.name) ancestorsSet.add(anc.data.name)
        });
      }

      const linkGenerator = d3
        .linkHorizontal<any, d3.HierarchyPointNode<TreeNode>>()
        .x((dNode: d3.HierarchyPointNode<TreeNode>) => dNode.y)
        .y((dNode: d3.HierarchyPointNode<TreeNode>) => dNode.x);

      const links = zoomableGroup
        .selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", linkGenerator)
        .attr("fill", "none")
        .attr("stroke", (linkDatum: d3.HierarchyLink<TreeNode>) => {
          const sourceName = linkDatum.source.data.name;
          const targetName = linkDatum.target.data.name;
          if (sourceName && targetName && ancestorsSet.has(sourceName) && ancestorsSet.has(targetName)) {
            return HIGHLIGHT_COLOR_PATH;
          }
          return "url(#linkGradient)";
        })
        .attr("stroke-width", (linkDatum: d3.HierarchyLink<TreeNode>) => {
          const sourceName = linkDatum.source.data.name;
          const targetName = linkDatum.target.data.name;
          if (sourceName && targetName && ancestorsSet.has(sourceName) && ancestorsSet.has(targetName)) {
            return isSmallScreen ? 2.5 : 3.5;
          }
          return isSmallScreen ? 1.5 : 2;
        })
        .attr("opacity", 0);

      links
        .transition()
        .duration(ANIM_DURATION_FAST) 
        .delay((d, i) => i * ANIM_LINK_DELAY_FACTOR) 
        .attr("opacity", 1);

      const node = zoomableGroup
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (dHier: d3.HierarchyNode<TreeNode>) => {
          const dPoint = dHier as d3.HierarchyPointNode<TreeNode>;
          return `translate(${dPoint.y},${dPoint.x})`;
        })
        .attr("opacity", 0);

      node
        .append("circle")
        .attr("r", 0)
        .attr("fill", (dHier: d3.HierarchyNode<TreeNode>) => {
          const nodeName = dHier.data.name;
          const nodeNameLower = nodeName ? nodeName.toLowerCase() : "";
          if (speciesNameToMatch && nodeNameLower === speciesNameToMatch) {
            return HIGHLIGHT_COLOR_TARGET; 
          }
          if (nodeName && ancestorsSet.has(nodeName)) {
            return HIGHLIGHT_COLOR_PATH; 
          }
          return dHier.children ? "#10b981" : "#06b6d4";
        })
        .attr("stroke", (dHier: d3.HierarchyNode<TreeNode>) => {
          if (dHier.data.name && ancestorsSet.has(dHier.data.name)) {
             return HIGHLIGHT_COLOR_PATH; 
          }
          return "#fff";
        })
        .attr("stroke-width", (dHier: d3.HierarchyNode<TreeNode>) => {
          if (dHier.data.name && ancestorsSet.has(dHier.data.name)) {
            return isSmallScreen ? 1.5 : 2.5;
          }
          return isSmallScreen ? 1 : 2;
        })
        .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

      node
        .filter((dHier: d3.HierarchyNode<TreeNode>) => !dHier.children)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (dHier: d3.HierarchyNode<TreeNode>) => {
            return dHier.children ? (isSmallScreen ? -6 : -8) : (isSmallScreen ? 8 : 12);
        })
        .attr("text-anchor", (dHier: d3.HierarchyNode<TreeNode>) => dHier.children ? "end" : "start")
        .text((dHier: d3.HierarchyNode<TreeNode>) => dHier.data.name)
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", (dHier: d3.HierarchyNode<TreeNode>) => {
          const nodeName = dHier.data.name;
          const nodeNameLower = nodeName ? nodeName.toLowerCase() : "";
          if (speciesNameToMatch && nodeNameLower === speciesNameToMatch) return "bold";
          if (nodeName && ancestorsSet.has(nodeName)) return "600"; 
          return "normal";
        })
        .attr("fill", (dHier: d3.HierarchyNode<TreeNode>) => {
          const nodeName = dHier.data.name;
          const nodeNameLower = nodeName ? nodeName.toLowerCase() : "";
          if (speciesNameToMatch && nodeNameLower === speciesNameToMatch) return HIGHLIGHT_COLOR_TARGET;
          if (nodeName && ancestorsSet.has(nodeName)) return HIGHLIGHT_COLOR_PATH;
          return "#374151";
        })
        .attr("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");
      
      node
        .filter((dHier: d3.HierarchyNode<TreeNode>) => !!dHier.children)
        .append("text")
        .attr("x", 0) 
        .attr("y", -(nodeRadius + (isSmallScreen ? 3 : 5))) 
        .attr("text-anchor", "middle") 
        .text((dHier: d3.HierarchyNode<TreeNode>) => dHier.data.name)
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", (dHier: d3.HierarchyNode<TreeNode>) => {
          const nodeName = dHier.data.name;
          const nodeNameLower = nodeName ? nodeName.toLowerCase() : "";
          if (speciesNameToMatch && nodeNameLower === speciesNameToMatch) return "bold";
          if (nodeName && ancestorsSet.has(nodeName)) return "600";
          return "normal";
        })
        .attr("fill", (dHier: d3.HierarchyNode<TreeNode>) => {
          const nodeName = dHier.data.name;
          const nodeNameLower = nodeName ? nodeName.toLowerCase() : "";
          if (speciesNameToMatch && nodeNameLower === speciesNameToMatch) return HIGHLIGHT_COLOR_TARGET;
          if (nodeName && ancestorsSet.has(nodeName)) return HIGHLIGHT_COLOR_PATH;
          return "#374151";
        })
        .attr("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");

      node
        .transition()
        .duration(ANIM_DURATION_NORMAL) 
        .delay((d, i) => i * ANIM_NODE_DELAY_FACTOR) 
        .attr("opacity", 1);

      node
        .select("circle")
        .transition()
        .duration(ANIM_DURATION_SHORT) 
        .delay((d, i) => (i * ANIM_NODE_DELAY_FACTOR) + ANIM_CIRCLE_EXTRA_DELAY) 
        .attr("r", nodeRadius);

      if (!zoomBehaviorRef.current) {
        zoomBehaviorRef.current = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.05, 10]) 
          .on("zoom", (event) => {
            if (treeGroupRef.current) {
              d3.select(treeGroupRef.current).attr("transform", event.transform);
            }
            setZoomLevel(event.transform.k);
          });
      }
      
      currentSvg.call(zoomBehaviorRef.current as any);

      const initialX = margin.left - (dataForHierarchy.branch_length || 0) * BRANCH_LENGTH_STRETCH_FACTOR / 2; 
      const initialY = margin.top - (dynamicClusterHeight / 2); 

      const initialTransform = d3.zoomIdentity
                                 .translate(initialX, initialY)
                                 .scale(1); 

      currentSvg.call((zoomBehaviorRef.current as any).transform, initialTransform);
      setZoomLevel(initialTransform.k);
    }

    updateTree(mergedRootData); 

    const resizeObserver = new ResizeObserver(() => {
      updateTree(mergedRootData); 
    });
    const currentContainer = containerRef.current; 
    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }
    
    const numNodesForAnimEstimate = (mergedRootData.children?.length || 0) * ((mergedRootData.children?.[0]?.children?.length) || 10); 
    const dynamicLoadingTimeout = Math.min(3000, ANIM_DURATION_FAST + (numNodesForAnimEstimate * ANIM_NODE_DELAY_FACTOR / 10) + 300);

    setTimeout(() => setIsLoading(false), dynamicLoadingTimeout); 

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      resizeObserver.disconnect();
    };
  }, [speciesName]); 
  
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call((zoomBehaviorRef.current as any).scaleBy, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call((zoomBehaviorRef.current as any).scaleBy, 0.7)
  }

  const handleReset = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight; 
    const isSmallScreen = width < 640;
    const margin = { 
        left: width * (isSmallScreen ? 0.08 : 0.1), 
        top: height * 0.05, 
        right: width * (isSmallScreen ? 0.15 : 0.2)
    };
    
    const initialX = margin.left - (phylogeneticDataFromFile.tree.branch_length || 0) * BRANCH_LENGTH_STRETCH_FACTOR / 2;
    const initialY = margin.top - (height - margin.top * 2) / 2; 

    const resetTransform = d3.zoomIdentity.translate(initialX, initialY).scale(1);
    
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call((zoomBehaviorRef.current as any).transform, resetTransform);
    setZoomLevel(1);
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-50">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-sm z-20"
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
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-600 shadow-lg border-emerald-200 z-10"
      >
        Zoom: {Math.round(zoomLevel * 100)}%
      </motion.div>
    </div>
  )
}