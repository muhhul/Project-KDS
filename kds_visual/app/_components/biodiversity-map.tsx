"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhylogeneticTree from "./phylogenetic-tree";
import Map, { Source, Layer, MapRef } from "react-map-gl/maplibre";
import { GeoJSONFeature, ExpressionSpecification, FilterSpecification } from "maplibre-gl";
import INDONESIA_GEO from "@/public/indonesia-provinces.json";

const provinceColorsPalette = [
  "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
  "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928",
  "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
  "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f",
  "#ffb3e6",
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
  longitude: 120,
  latitude: 6,
  zoom: 1,
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
  const [hoveredProvinceImage, setHoveredProvinceImage] = useState<string | null>(
    null
  );
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
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const transformAnimalData = (data: any[]): Record<string, any> => {
    return data.reduce(
      (acc, item) => {
        const provinceKey = item.Provinsi.toUpperCase();
        acc[provinceKey] = {
          name: item["Nama Umum"],
          scientificName: item["Nama Latin"],
          description:
            item["Deskripsi Singkat"] ||
            `Endemic species of ${item.Provinsi}.`,
          imageUrl: item.Image || "/placeholder.svg?height=200&width=200",
          videoUrl: item.Video !== "" ? item.Video : null,
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
        "fill-opacity": 0.8,
        "fill-outline-color": "#000000",
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
        "fill-color": "#FFF",
        "fill-opacity": 0.9,
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
        
        console.log("Species Data:", speciesData);

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

  const closePopupAndDialog = () => {
    setSelectedProvinceInfo(null);
    setIsDialogOpen(false);
    setHoveredProvinceImage(null);
    setIsPhylogeneticTreeOpen(false);
  };

  const fillLayer = createLayerStyle();
  const hoverLayer = createHoverLayerStyle();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
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

      <AnimatePresence>
        {hoveredProvinceImage && !isDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.3,
            }}
            className="fixed pointer-events-none z-30"
            style={{
              left: mousePosition.x - 100,
              top: mousePosition.y - 200,
            }}
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-xl bg-white">
                <img
                  src={hoveredProvinceImage || "/placeholder.svg"}
                  alt="Species preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
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
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="relative h-72 overflow-hidden">
                  {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" /> */}
                  {typeof selectedProvinceInfo.videoUrl === "string" && selectedProvinceInfo.videoUrl.endsWith(".mp4") ? (
                    <video
                      src={getGoogleDriveEmbedUrl(selectedProvinceInfo.videoUrl)}
                      width="100%"
                      height="100%"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="border-0 object-cover w-full h-full"
                      title={`Video of ${selectedProvinceInfo.name}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : typeof selectedProvinceInfo.videoUrl === "string" && selectedProvinceInfo.videoUrl.includes("drive.google.com") ? (
                    <iframe
                      src={getGoogleDriveEmbedUrl(selectedProvinceInfo.videoUrl)}
                      width="100%"
                      height="100%"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="border-0"
                      title={`Video of ${selectedProvinceInfo.name}`}
                    ></iframe>
                  ) : selectedProvinceInfo.videoUrl ? (
                    <p className="text-gray-600 text-center pt-20">
                      Video preview not available or format not supported.
                    </p>
                  ) : (
                    <img
                      src={selectedProvinceInfo.imageUrl || "/placeholder.svg"}
                      alt={selectedProvinceInfo.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-6 z-20">
                    <h2 className="text-white text-2xl font-bold tracking-tight mb-1">
                      {selectedProvinceInfo.name}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {selectedProvinceInfo.provinceName}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                      Endemic Species
                    </div>
                    <div className="text-sm text-gray-500 italic">
                      {selectedProvinceInfo.scientificName}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedProvinceInfo.description}
                    </p>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Habitat Information
                      </h4>
                      <p className="text-sm text-gray-600">
                        This species is native to the{" "}
                        {selectedProvinceInfo.provinceName} region of Indonesia,
                        where it inhabits specific ecosystems crucial for its
                        survival.
                      </p>
                    </div>

                    {selectedProvinceInfo.scientificName !== "N/A" && (
                      <div className="pt-2">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                          onClick={handleViewSpeciesTree}
                        >
                          View Phylogenetic Tree
                        </Button>
                      </div>
                    )}
                  </div>
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
            closePopupAndDialog();
          }
        }}
      >
        <DialogContent className="h-[700px] sm:max-w-7xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Phylogenetic Tree for{" "}
              {selectedProvinceInfo
                ? selectedProvinceInfo.name
                : "Selected Species"}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px] w-full">
            {selectedProvinceInfo?.scientificName &&
            selectedProvinceInfo.scientificName !== "N/A" ? (
              <PhylogeneticTree
                speciesName={selectedProvinceInfo.scientificName}
              />
            ) : (
              <p className="text-center text-gray-600">
                No phylogenetic data available for this selection.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}