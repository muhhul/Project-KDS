"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SpeciesForm from "@/app/_components/species-form";
import PhylogeneticTree from "@/app/_components/phylogenetic-tree";
import { Button } from "@/components/ui/button";
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
        className="container mx-auto px-4 py-12 relative z-10 gap-10 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            className="inline-flex items-center gap-3 mb-5"
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
            <h1 className="text-3xl md:text-7xl font-batik font-bold text-white drop-shadow-lg">
              SatwaNesia
            </h1>
          </motion.div>

          <motion.p
            className="text-sm md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed font-tropical"
            variants={itemVariants}
          >
            Explore Indonesia's rich biodiversity through interactive
            phylogenetic trees and geographic distribution maps
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full justify-center items-center flex"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group w-fit"
          >
            <Link href={"/map"}>
              <Card className="glass-morphism border-white/30 h-full p-0 hover:border-white/50 transition-all duration-500 overflow-hidden">
                <CardContent className="p-3 px-7 text-center flex flex-row justify-center items-center gap-5 ">
                  <motion.div
                    className={`inline-flex items-center justify-center w-8 h-8 bg-blue-400/20 backdrop-blur-sm rounded-full group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <MapPin className="h-4 w-4 text-white" />
                  </motion.div>
                  <p className="text-white/80 font-tropical leading-relaxed">
                    Explore Species Distribution Map
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          {/* Quick Access to Map */}
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
              <Card className="glass-morphism py-0 gap-0 overflow-clip border-white/30 shadow-tropical hover:shadow-glow transition-all duration-700">
                <CardHeader className="sunset-gradient text-white rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 batik-pattern opacity-20" />
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 pt-5"
                  >
                    <CardTitle className="text-3xl font-batik flex items-start gap-3">
                      <motion.div
                        className="p-2 bg-white/20 rounded-full"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Leaf className="h-8 w-8" />
                      </motion.div>
                      <div>
                        Phylogenetic Tree: {speciesName}
                        <div className="text-white/90 font-tropical text-lg mt-2">
                          Visualization of genetic relationships between species
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription className=""></CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="h-[600px] relative p-0">
                  <PhylogeneticTree speciesName={speciesName} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            className="inline-flex items-center gap-2 text-white/80 font-tropical"
            whileHover={{ scale: 1.05 }}
          >
            <Sun className="h-5 w-5 animate-wave" />
            <span>Preserving the Natural Heritage of the Archipelago</span>
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
