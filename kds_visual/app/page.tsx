"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import SpeciesForm from "@/app/_components/species-form"
import PhylogeneticTree from "@/app/_components/phylogenetic-tree"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Dna, Leaf, Sun, Github, Linkedin } from "lucide-react"

export default function Home() {
  const [showResults, setShowResults] = useState(false)
  const [speciesName, setSpeciesName] = useState("")
  const [hoveredGithub, setHoveredGithub] = useState(false)
  const [hoveredLinkedin, setHoveredLinkedin] = useState(false)

  const handleAnalysisComplete = (species: string) => {
    setSpeciesName(species)
    setShowResults(true)
  }

  const creators = [
    {
      name: "0x0wen",
      github: "https://github.com/0x0wen",
      linkedin: "https://www.linkedin.com/in/owentobias/",
    },
    {
      name: "thoriqsaputra",
      github: "https://github.com/thoriqsaputra",
      linkedin: "https://www.linkedin.com/in/thoriqsaputra/",
    },
    {
      name: "muhhul",
      github: "https://github.com/muhhul",
      linkedin: "https://www.linkedin.com/in/muhhul/",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

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
  }

  return (
    <>
      <main className="h-screen relative overflow-hidden">
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

        {/* Social Media Expandable Buttons */}
        <div className="fixed top-6 right-6 z-40 flex flex-col gap-3">
          {/* GitHub Button */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredGithub(true)}
            onMouseLeave={() => setHoveredGithub(false)}
          >
            {/* Invisible hover area that extends to the expanded list */}
            <div
              className={`absolute -left-64 -top-2 -bottom-2 right-0 ${hoveredGithub ? "pointer-events-auto" : "pointer-events-none"}`}
            ></div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 300 }}
            >
              <Button className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <Github className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* GitHub Accounts Expansion */}
            <AnimatePresence>
              {hoveredGithub && (
                <motion.div
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col gap-2 pt-20">
                    {creators.map((creator, index) => (
                      <motion.a
                        key={`github-${creator.name}`}
                        href={creator.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: {
                            delay: index * 0.08,
                            duration: 0.2,
                          },
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="bg-white/10 backdrop-blur-sm rounded-full py-1.5 px-3 flex items-center gap-2 hover:bg-white/20 transition-colors duration-200">
                          <Github className="h-4 w-4 text-white" />
                          <span className="text-white text-sm">{creator.name}</span>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LinkedIn Button */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredLinkedin(true)}
            onMouseLeave={() => setHoveredLinkedin(false)}
          >
            {/* Invisible hover area that extends to the expanded list */}
            <div
              className={`absolute -left-64 -top-2 -bottom-2 right-0 ${hoveredLinkedin ? "pointer-events-auto" : "pointer-events-none"}`}
            ></div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
            >
              <Button className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* LinkedIn Accounts Expansion */}
            <AnimatePresence>
              {hoveredLinkedin && (
                <motion.div
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col gap-2">
                    {creators.map((creator, index) => (
                      <motion.a
                        key={`linkedin-${creator.name}`}
                        href={creator.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: {
                            delay: index * 0.08,
                            duration: 0.2,
                          },
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="bg-white/10 backdrop-blur-sm rounded-full py-1.5 px-3 flex items-center gap-2 hover:bg-white/20 transition-colors duration-200">
                          <Linkedin className="h-4 w-4 text-white" />
                          <span className="text-white text-sm">{creator.name}</span>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="container mx-auto px-4 py-8 relative z-10 h-full flex flex-col justify-center gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-14">
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <Dna className="h-8 w-8 md:h-10 md:w-10 text-batik-gold" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-batik font-bold text-white drop-shadow-lg">
                SatwaNesia
              </h1>
            </motion.div>

            <motion.p
              className="text-sm md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-tropical"
              variants={itemVariants}
            >
              Explore Indonesia's rich biodiversity through interactive phylogenetic trees and geographic distribution
              maps
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full justify-center items-center flex">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group w-fit"
            >
              <Link href={"/map"}>
                <Card className="glass-morphism border-white/30 h-full p-0 hover:border-white/50 transition-all duration-500 overflow-hidden">
                  <CardContent className="p-3 px-6 text-center flex flex-row justify-center items-center gap-4">
                    <motion.div
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-400/20 backdrop-blur-sm rounded-full group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </motion.div>
                    <p className="text-white/80 font-tropical leading-relaxed">Explore Species Distribution Map</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 min-h-0">
            <SpeciesForm onAnalysisComplete={handleAnalysisComplete} />
          </motion.div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="flex-1 min-h-0"
              >
                <Card className="glass-morphism h-full overflow-hidden border-white/30 shadow-tropical hover:shadow-glow transition-all duration-700">
                  <CardHeader className="sunset-gradient text-white relative overflow-hidden py-4">
                    <div className="absolute inset-0 batik-pattern opacity-20" />
                    <motion.div
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="relative z-10"
                    >
                      <CardTitle className="text-xl md:text-2xl font-batik flex items-center gap-3">
                        <motion.div
                          className="p-2 bg-white/20 rounded-full"
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Leaf className="h-6 w-6" />
                        </motion.div>
                        <div>
                          Phylogenetic Tree: {speciesName}
                          <div className="text-white/90 font-tropical text-sm md:text-base mt-1">
                            Visualization of genetic relationships
                          </div>
                        </div>
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 h-[400px]">
                    <PhylogeneticTree speciesName={speciesName} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              className="inline-flex items-center gap-2 text-white/80 font-tropical text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Sun className="h-4 w-4 animate-wave" />
              <span>Preserving the Natural Heritage of the Archipelago</span>
              <Sun className="h-4 w-4 animate-wave" style={{ animationDelay: "1s" }} />
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </>
  )
}
