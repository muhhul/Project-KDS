"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PhylogeneticTree from "./phylogenetic-tree";
import Map, { Source, Layer, type MapRef } from "react-map-gl/maplibre";
import type {
  GeoJSONFeature,
  ExpressionSpecification,
  FilterSpecification,
} from "maplibre-gl";
import INDONESIA_GEO from "@/public/indonesia-provinces.json";

const provinceColorsPalette = [
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#6366f1",
  "#d946ef",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#6366f1",
  "#d946ef",
  "#3b82f6",
  "#06b6d4",
];

const simpleStringHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const getProvinceColor = (provinceIdentifier: string) => {
  if (!provinceIdentifier) {
    return provinceColorsPalette[0];
  }
  const hash = simpleStringHash(provinceIdentifier);
  return provinceColorsPalette[hash % provinceColorsPalette.length];
};

const getGoogleDriveEmbedUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  if (url.includes("drive.google.com")) {
    const fileIdMatch = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  } else if (url.endsWith(".mp4")) {
    return url.startsWith("/") ? url : `/${url}`;
  }
  return url;
};

const INITIAL_VIEW_STATE = {
  longitude: 118,
  latitude: -2,
  zoom: 4.5,
  pitch: 0,
  bearing: 0,
};

const BOUNDS = {
  minLongitude: 95,
  maxLongitude: 141,
  minLatitude: -11,
  maxLatitude: 6,
};

export default function BiodiversityMap() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [selectedProvinceInfo, setSelectedProvinceInfo] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredProvinceImage, setHoveredProvinceImage] = useState<
    string | null
  >(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPhylogeneticTreeOpen, setIsPhylogeneticTreeOpen] = useState(false);
  const [geoData, setGeoData] = useState<any>(INDONESIA_GEO);
  const [hoveredFeature, setHoveredFeature] = useState<GeoJSONFeature | null>(
    null
  );
  const [provinceSpeciesData, setProvinceSpeciesData] = useState<
    Record<string, any>
  >({
    DEFAULT: {
      name: "Various Indonesian Wildlife",
      scientificName: "N/A",
      description: "This province is rich in biodiversity.",
      imageUrl: "/placeholder.svg?height=200&width=200",
      videoUrl: null,
      conservationStatus: "Unknown",
      habitat: "Various habitats",
      taxonomy: "N/A",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const transformAnimalData = (data: any[]): Record<string, any> => {
    return data.reduce(
      (acc, item) => {
        const provinceKey = item.Provinsi.toUpperCase();
        acc[provinceKey] = {
          name: item["Nama Umum"],
          scientificName: item["Nama Latin"],
          description:
            item["Deskripsi Singkat"] || `Endemic species of ${item.Provinsi}.`,
          imageUrl: item.Image || "/placeholder.svg?height=200&width=200",
          videoUrl: item.Video !== "" ? item.Video : null,
          conservationStatus: item["Status Konservasi"] || "Unknown",
          habitat: item.Habitat || "Various habitats",
          taxonomy: item["Taxonomy name"] || "N/A",
        };
        return acc;
      },
      {
        DEFAULT: {
          name: "Various Indonesian Wildlife",
          scientificName: "N/A",
          description: "This province is rich in biodiversity.",
          imageUrl: "/placeholder.svg?height=200&width=200",
          videoUrl: null,
          conservationStatus: "Unknown",
          habitat: "Various habitats",
          taxonomy: "N/A",
        },
      }
    );
  };

  useEffect(() => {
    fetch("/animals.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const transformedData = transformAnimalData(data);
        setProvinceSpeciesData(transformedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading animals.json:", error);
        setLoadingError("Failed to load biodiversity data");
        setIsLoading(false);
      });
  }, []);

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (hoveredProvinceImage && !isDialogOpen) {
      document.addEventListener("mousemove", handleMouseMoveGlobal);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMoveGlobal);
    };
  }, [hoveredProvinceImage, isDialogOpen]);

  const createLayerStyle = useCallback(() => {
    if (!geoData || !geoData.features) return null;

    const colorExpressionElements: any[] = ["case"];
    geoData.features.forEach((feature: GeoJSONFeature) => {
      if (
        feature.properties &&
        typeof feature.properties.provinsi === "string"
      ) {
        const provinceName = feature.properties.provinsi;
        const color = getProvinceColor(provinceName);
        colorExpressionElements.push(
          ["==", ["get", "provinsi"], provinceName],
          color
        );
      }
    });
    colorExpressionElements.push(provinceColorsPalette[0]);

    return {
      id: "provinces-fill",
      type: "fill" as const,
      paint: {
        "fill-color": colorExpressionElements as ExpressionSpecification,
        "fill-opacity": 0.7,
        "fill-outline-color": "#ffffff",
      },
    };
  }, [geoData]);

  const createHoverLayerStyle = useCallback(() => {
    const filter: FilterSpecification =
      hoveredFeature && hoveredFeature.properties?.provinsi
        ? ["==", ["get", "provinsi"], hoveredFeature.properties.provinsi]
        : ["==", ["get", "provinsi"], ""];
    return {
      id: "provinces-hover",
      type: "fill" as const,
      paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 0.3,
      },
      filter,
    };
  }, [hoveredFeature]);

  const handleClick = useCallback(
    (event: any) => {
      const features = event.features;
      if (features && features.length > 0) {
        const feature = features[0];
        const provinceName = feature.properties?.provinsi;
        const speciesData = provinceSpeciesData[provinceName?.toUpperCase()];

        if (speciesData) {
          setSelectedProvinceInfo({
            ...speciesData,
            provinceName: provinceName || "Unknown Province",
          });
          setIsDialogOpen(true);
        } else {
          setSelectedProvinceInfo({
            name: provinceName || "Unknown Province",
            scientificName: "N/A",
            description:
              "Detailed biodiversity information for this province is not yet available.",
            imageUrl: provinceSpeciesData["DEFAULT"].imageUrl,
            videoUrl: provinceSpeciesData["DEFAULT"].videoUrl,
            provinceName: provinceName || "Unknown Province",
            conservationStatus: "Unknown",
            habitat: "Various habitats",
            taxonomy: "N/A",
          });
          setIsDialogOpen(true);
        }
        setHoveredProvinceImage(null);
      }
    },
    [provinceSpeciesData]
  );

  const handleMouseMove = useCallback(
    (event: any) => {
      const features = event.features;
      if (features && features.length > 0 && !isDialogOpen) {
        const feature = features[0];
        setHoveredFeature(feature);

        const provinceName = feature.properties?.provinsi;
        const speciesData =
          provinceSpeciesData[provinceName?.toUpperCase()] ||
          provinceSpeciesData["DEFAULT"];

        if (speciesData && speciesData.imageUrl) {
          setHoveredProvinceImage(speciesData.imageUrl);
        }
      } else {
        setHoveredFeature(null);
        setHoveredProvinceImage(null);
      }
    },
    [isDialogOpen, provinceSpeciesData]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredFeature(null);
    setHoveredProvinceImage(null);
  }, []);

  const handleViewSpeciesTree = () => {
    setIsPhylogeneticTreeOpen(!isPhylogeneticTreeOpen);
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        ...INITIAL_VIEW_STATE,
        duration: 1000,
      });
    }
  };

  const closePopupAndDialog = () => {
    setSelectedProvinceInfo(null);
    setIsDialogOpen(false);
    setHoveredProvinceImage(null);
    setIsPhylogeneticTreeOpen(false);
    setIsVideoPlaying(true);
  };

  const getConservationStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "critically endangered":
        return "bg-red-100 text-red-800 border-red-200";
      case "endangered":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "vulnerable":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "near threatened":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "least concern":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const fillLayer = createLayerStyle();
  const hoverLayer = createHoverLayerStyle();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div className="text-lg font-medium text-slate-700">
            Loading biodiversity data...
          </div>
          <div className="text-sm text-slate-500">
            Preparing Indonesia's wildlife map
          </div>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center space-y-4 p-8">
          <div className="text-lg font-medium text-red-700">
            Error loading data
          </div>
          <div className="text-sm text-red-600">{loadingError}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Enhanced Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 right-4 flex flex-col space-y-2 z-10"
      >
        {[
          { icon: ZoomIn, action: handleZoomIn, tooltip: "Zoom In" },
          { icon: ZoomOut, action: handleZoomOut, tooltip: "Zoom Out" },
          { icon: RotateCcw, action: handleResetView, tooltip: "Reset View" },
        ].map((btn, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={btn.action}
              className="bg-white/95 backdrop-blur-sm border-white/60 hover:bg-white hover:border-white/80 shadow-lg hover:shadow-xl transition-all duration-200"
              title={btn.tooltip}
            >
              <btn.icon className="h-4 w-4 text-slate-700" />
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Map */}
      {geoData && (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          interactiveLayerIds={["provinces-fill"]}
          maxBounds={[
            [BOUNDS.minLongitude, BOUNDS.minLatitude],
            [BOUNDS.maxLongitude, BOUNDS.maxLatitude],
          ]}
          cursor={hoveredFeature ? "pointer" : "default"}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <Source id="provinces" type="geojson" data={geoData}>
            {fillLayer && <Layer {...fillLayer} />}
            {hoverLayer && <Layer {...hoverLayer} />}
          </Source>
        </Map>
      )}

      {/* Enhanced Hover Preview */}
      <AnimatePresence>
        {hoveredProvinceImage && !isDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.3,
            }}
            className="fixed pointer-events-none z-30"
            style={{
              left: Math.min(mousePosition.x - 75, window.innerWidth - 160),
              top: Math.max(mousePosition.y - 180, 20),
            }}
          >
            <Card className="w-32 bg-white/95 backdrop-blur-sm py-0 border-white/60 shadow-xl overflow-hidden">
              <CardContent className="p-0">

                <div className="aspect-square overflow-hidden">
                  <img
                    src={hoveredProvinceImage || "/placeholder.svg"}
                    alt="Species preview"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-2 text-center">
                  <div className="text-xs font-medium text-slate-700">
                    Click to explore
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProvinceInfo && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                closePopupAndDialog();
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="hidden">
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {selectedProvinceInfo.name}
                </DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative"
              >
                <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {typeof selectedProvinceInfo.videoUrl === "string" &&
                  selectedProvinceInfo.videoUrl.endsWith(".mp4") ? (
                    <div className="relative h-full">
                      <video
                        src={getGoogleDriveEmbedUrl(
                          selectedProvinceInfo.videoUrl
                        )}
                        width="100%"
                        height="100%"
                        autoPlay={isVideoPlaying}
                        loop
                        muted
                        playsInline
                        className="object-cover w-full h-full"
                        title={`Video of ${selectedProvinceInfo.name}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 z-20"
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      >
                        {isVideoPlaying ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </div>
                  ) : typeof selectedProvinceInfo.videoUrl === "string" &&
                    selectedProvinceInfo.videoUrl.includes(
                      "drive.google.com"
                    ) ? (
                    <iframe
                      src={getGoogleDriveEmbedUrl(
                        selectedProvinceInfo.videoUrl
                      )}
                      width="100%"
                      height="100%"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="border-0"
                      title={`Video of ${selectedProvinceInfo.name}`}
                    />
                  ) : (
                    <img
                      src={selectedProvinceInfo.imageUrl || "/placeholder.svg"}
                      alt={selectedProvinceInfo.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-slate-900/40">
                    <div className="space-y-2">
                      <h2 className="text-white text-3xl font-bold tracking-tight">
                        {selectedProvinceInfo.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedProvinceInfo.provinceName}
                        </Badge>
                        {selectedProvinceInfo.conservationStatus && (
                          <Badge
                            className={getConservationStatusColor(
                              selectedProvinceInfo.conservationStatus
                            )}
                          >
                            {selectedProvinceInfo.conservationStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {selectedProvinceInfo.scientificName !== "N/A" && (
                    <div className="text-center">
                      <div className="text-sm text-slate-500 mb-1">
                        Scientific Name
                      </div>
                      <div className="text-lg font-medium italic text-slate-700">
                        {selectedProvinceInfo.scientificName}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-800">
                      About This Species
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedProvinceInfo.description}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Habitat & Distribution
                    </h4>
                    <p className="text-sm text-slate-600">
                      {selectedProvinceInfo.habitat ||
                        `This species is native to the ${selectedProvinceInfo.provinceName} region of Indonesia, where it inhabits specific ecosystems crucial for its survival.`}
                    </p>
                  </div>

                  {selectedProvinceInfo.scientificName !== "N/A" && (
                    <div className="pt-2">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={handleViewSpeciesTree}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>View Phylogenetic Tree</span>
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Dialog
        open={
          isDialogOpen &&
          !!selectedProvinceInfo?.scientificName &&
          selectedProvinceInfo?.scientificName !== "N/A" &&
          isPhylogeneticTreeOpen
        }
        onOpenChange={(open) => {
          if (!open) {
            setIsPhylogeneticTreeOpen(false)
          }
        }}
      >
        <DialogContent className="h-[700px] sm:max-w-7xl bg-white/98 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Phylogenetic Tree for{" "}
              {selectedProvinceInfo
                ? selectedProvinceInfo.name
                : "Selected Species"}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px] w-full">
            {selectedProvinceInfo?.taxonomy &&
            selectedProvinceInfo.taxonomy !== "N/A" ? (
              <PhylogeneticTree
                speciesName={selectedProvinceInfo.taxonomy}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center text-slate-600">
                <div className="space-y-2">
                  <div className="text-lg">No phylogenetic data available</div>
                  <div className="text-sm">for this selection.</div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
