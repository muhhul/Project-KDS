"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SpeciesForm from "@/app/_components/species-form";
import PhylogeneticTree from "@/app/_components/phylogenetic-tree";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Dna, Leaf, Sun } from "lucide-react";

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [speciesName, setSpeciesName] = useState("");

  const handleAnalysisComplete = (species: string) => {
    setSpeciesName(species);
    setShowResults(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 tropical-gradient">
        <div className="absolute inset-0 batik-pattern opacity-30" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 opacity-20"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="w-full h-full bg-batik-gold rounded-full blur-xl" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-16 w-24 h-24 opacity-25"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        >
          <div className="w-full h-full bg-coral-pink rounded-full blur-lg" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 opacity-30"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 4 }}
        >
          <div className="w-full h-full bg-ocean-blue rounded-full blur-md" />
        </motion.div>
      </div>

      <motion.div
        className="container mx-auto px-4 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <Dna className="h-10 w-10 text-batik-gold" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-batik font-bold text-white drop-shadow-lg">
              Biodiversity
              <span className="block text-3xl md:text-4xl font-tropical font-normal text-warm-cream/90 mt-2">
                Indonesia
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-tropical mb-8"
            variants={itemVariants}
          >
            Explore Indonesia's rich biodiversity through interactive
            phylogenetic trees and geographic distribution maps
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              id: "1",
              icon: Dna,
              title: "Phylogenetic Analysis",
              description: "Evolutionary relationships among species analysis",
              href: "#analysis",
              gradient: "from-batik-gold to-sunset-orange",
              iconBg: "bg-amber-400/20",
            },
            {
              id: "2",
              icon: MapPin,
              title: "Biodiversity Map",
              description:
                "Explore the distribution of species across the archipelago",
              href: "/map",
              gradient: "from-ocean-blue to-deep-teal",
              iconBg: "bg-blue-400/20",
            },
            {
              id: "3",
              icon: Leaf,
              title: "Species Database",
              description: "Collection of endemic species data in Indonesia",
              href: "#database",
              gradient: "from-tropical-green to-batik-brown",
              iconBg: "bg-green-400/20",
            },
          ].map((item, index) => (
            <motion.div
              key={item.id + index}
              whileHover={item.id === "2" ? { y: -8, scale: 1.02 } : {}}
              whileTap={item.id === "2" ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <Link
                href={item.href}
                className={`${item.id !== "2" ? "cursor-default" : ""}`}
                onClick={(e) => {
                  if (item.id !== "2") {
                    e.preventDefault();
                  }
                }}
                aria-disabled={item.id !== "2"}
                tabIndex={item.id !== "2" ? -1 : undefined}
              >
                <Card className="glass-morphism border-white/30 h-full hover:border-white/50 transition-all duration-500 overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 ${item.iconBg} backdrop-blur-sm rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-batik font-semibold text-white mb-1">
                      {item.title}
                    </h3>

                    <p className="text-white/80 font-tropical leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} id="analysis">
          <SpeciesForm onAnalysisComplete={handleAnalysisComplete} />
        </motion.div>

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="mt-16"
            >
              <Card className="glass-morphism pt-0 overflow-clip border-white/30 shadow-tropical hover:shadow-glow transition-all duration-700">
                <CardHeader className="sunset-gradient text-white rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 batik-pattern opacity-20" />
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 pt-5"
                  >
                    <CardTitle className="text-3xl font-batik flex items-center gap-3">
                      <motion.div
                        className="p-2 bg-white/20 rounded-full"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Leaf className="h-8 w-8" />
                      </motion.div>
                      Phylogenetic Tree: {speciesName}
                    </CardTitle>
                    <CardDescription className="text-white/90 font-tropical text-lg mt-2">
                      Visualization of genetic relationships between species
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="h-[600px] relative p-0">
                  <PhylogeneticTree speciesName={speciesName} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="mt-20 text-center">
          <motion.div
            className="inline-flex items-center gap-2 text-white/80 font-tropical"
            whileHover={{ scale: 1.05 }}
          >
            <Sun className="h-5 w-5 animate-wave" />
            <span>Melestarikan Kekayaan Alam Nusantara</span>
            <Sun
              className="h-5 w-5 animate-wave"
              style={{ animationDelay: "1s" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
