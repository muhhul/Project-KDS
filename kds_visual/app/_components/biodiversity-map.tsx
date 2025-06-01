"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockSpeciesLocations } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhylogeneticTree from "./phylogenetic-tree";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const INDONESIA_GEO_URL = "/indonesia-provinces.json";

export default function BiodiversityMap() {
  const [position, setPosition] = useState({
    coordinates: [118, -2.5],
    zoom: 1,
  });
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkerClick = (species: any) => {
    setSelectedSpecies(species);
  };

  const handleViewSpeciesTree = () => {
    setIsDialogOpen(true);
  };

  const handleZoomIn = () => {
    if (position.zoom >= 5) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.3 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.5) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.3 }));
  };

  const handleMoveEnd = (position: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    setPosition(position);
  };

  const closePopup = () => {
    setSelectedSpecies(null);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-sm z-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="ml-3 text-blue-700 font-medium">
              Loading biodiversity map...
            </span>
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
              className="bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-lg"
              title={btn.tooltip}
            >
              <btn.icon className="h-4 w-4 text-blue-600" />
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {!isLoading && (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 600,
            center: [118, -2.5],
          }}
          width={800}
          height={600}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={handleMoveEnd}
            filterZoomEvent={(event: any) =>
              !(
                event.target instanceof SVGElement &&
                event.target.closest(".no-zoom")
              )
            }
          >
            <Geographies geography={INDONESIA_GEO_URL}>
              {({
                geographies,
              }: {
                geographies: Array<{
                  rsmKey: string;
                  properties: { provinsi: string };
                }>;
              }) =>
                geographies.map(
                  (geo) => (
                    console.log("Rendering geography:", geo.rsmKey),
                    console.log("Properties:", geo),
                    (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#86efac"
                        stroke="#059669"
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: "#4ade80",
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={() => {
                          const provinceName = geo.properties.provinsi;
                          setTooltipContent(provinceName || "Unknown Province");
                        }}
                        onMouseLeave={() => {
                          setTooltipContent("");
                        }}
                      />
                    )
                  )
                )
              }
            </Geographies>

            {/* Species markers */}
            {mockSpeciesLocations.map((species, index) => {
              const isHovered = hoveredMarker === index;
              return (
                <Marker
                  key={index}
                  coordinates={[species.longitude, species.latitude]}
                  onClick={() => handleMarkerClick(species)}
                  onMouseEnter={() => setHoveredMarker(index)}
                  onMouseLeave={() => setHoveredMarker(null)}
                >
                  {/* Base circle for the marker */}
                  <motion.circle
                    r={isHovered ? 7 / position.zoom : 5 / position.zoom} // Adjust size based on zoom
                    fill={isHovered ? "#dc2626" : "#ef4444"}
                    stroke="#fff"
                    strokeWidth={1 / position.zoom}
                    style={{ cursor: "pointer" }}
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  {/* Pulsing animation for hovered marker */}
                  {isHovered && (
                    <motion.circle
                      r={10 / position.zoom}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={1 / position.zoom}
                      strokeOpacity="0.5"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: [0, 0.5, 0] }} // Pulsing opacity
                      transition={{
                        duration: 1.2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  {/* You might not need text inside the marker if they are too small, or adjust font size */}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      )}

      {/* Tooltip for province names */}
      {tooltipContent && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-md text-sm shadow-lg z-10">
          {tooltipContent}
        </div>
      )}

      {/* Selected Species Popup - Positioning needs careful re-evaluation */}
      {/* The previous way of calculating left/top based on SVG coordinates and scale/translate
          will not work directly with react-simple-maps' projection.
          You might need to get projected coordinates from react-simple-maps, or
          position the popup relative to the clicked marker's screen position.
          For simplicity, this example omits the complex dynamic positioning of the popup.
          A common pattern is to position it at a fixed screen location or relative to the map container.
      */}
      <AnimatePresence>
        {selectedSpecies && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300 }}
            // className="absolute z-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-blue-200"
            // style={{ /* left: ..., top: ... */ }} // You'll need a new strategy for positioning
            // For now, let's fix its position for demonstration
            className="absolute z-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-blue-200 no-zoom" // Added no-zoom
            style={{
              bottom: "20px",
              right: "20px",
              maxWidth: "280px",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={closePopup}
            >
              ×
            </motion.button>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800 mb-1">
                  {selectedSpecies.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 italic">
                  {selectedSpecies.scientificName}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {selectedSpecies.description}
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                    onClick={handleViewSpeciesTree}
                  >
                    View Phylogenetic Tree
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-600 shadow-lg border border-blue-200 z-10"
      >
        Zoom: {Math.round(position.zoom * 100)}%
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[700px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {selectedSpecies ? selectedSpecies.name : "Species"} Phylogenetic
              Tree
            </DialogTitle>
          </DialogHeader>
          <div className="h-[600px] w-full">
            <PhylogeneticTree speciesName={selectedSpecies?.scientificName} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
