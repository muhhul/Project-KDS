"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Dna,
  Compass,
  FlagIcon as Island,
  Waves,
  Mountain,
} from "lucide-react";
import BiodiversityMap from "@/app/_components/biodiversity-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MapPage() {
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
      y: [0, -8, 0],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 ocean-gradient">
        <div className="absolute inset-0 batik-pattern opacity-20" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 right-24 w-28 h-28 opacity-25"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="w-full h-full bg-coral-pink rounded-full blur-xl" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 w-36 h-36 opacity-20"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2.5 }}
        >
          <div className="w-full h-full bg-batik-gold rounded-full blur-2xl" />
        </motion.div>
      </div>

      <motion.div
        className="container mx-auto px-4 py-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  variant="outline"
                  className="glass-morphism border-white/40 hover:border-white/60 text-white hover:bg-white/10 transition-all duration-300 font-tropical"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </motion.div>
            </Link>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl font-batik font-bold text-white drop-shadow-lg">
                Biodiversity Map
                <span className="block text-xl md:text-2xl font-tropical font-normal text-white/80 mt-1">
                  Nusantara
                </span>
              </h1>
            </motion.div>
          </div>

          <motion.div
            className="hidden md:flex items-center gap-2 glass-morphism px-4 py-2 rounded-full border-white/30"
            whileHover={{ scale: 1.05 }}
          >
            <Compass className="h-5 w-5 text-batik-gold animate-wave" />
            <span className="text-white font-tropical">
              Explore the islands
            </span>
          </motion.div>
        </motion.div>
        <div className="w-full flex items-center justify-center">
          <motion.p
            variants={itemVariants}
            className="text-white/90 mb-10 max-w-4xl leading-relaxed text-center text-sm md:text-lg font-tropical"
          >
            Discover the geographic distribution of Indonesia's unique species
            across the archipelago. Click on markers to explore detailed
            information and phylogenetic relationships.
          </motion.p>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="glass-morphism border-white/30 py-0 gap-0 shadow-ocean hover:shadow-glow transition-all duration-700 overflow-hidden">
            <CardHeader className="sunset-gradient text-white relative">
              <div className="absolute inset-0 batik-pattern opacity-20" />
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 pt-5"
              >
                <CardTitle className="md:text-3xl text-2xl font-batik flex items-center gap-3">
                  <motion.div
                  className="p-2 bg-white/20 rounded-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  >
                  <MapPin className="h-8 w-8" />
                  </motion.div>
                  Interactive Biodiversity Map
                </CardTitle>
                <CardDescription className="text-white/90 font-tropical text-sm md:text-lg mt-2">
                  Explore the distribution of species across the Indonesian archipelago
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="h-[700px] relative p-0">
              <BiodiversityMap />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {[
            {
              icon: Island,
              title: "Interactive Navigation",
              desc: "Zoom and pan to explore different regions",
              gradient: "from-blue-400 to-green-500",
            },
            {
              icon: Dna,
              title: "Species Details",
              desc: "Click markers for complete species information",
              gradient: "from-amber-500 to-amber-700",
            },
            {
              icon: Mountain,
              title: "Phylogenetic Tree",
              desc: "View evolutionary relationships between species",
              gradient: "from-green-400 to-amber-800",
            },
            {
              icon: Waves,
              title: "Geographic Data",
              desc: "Accurate location mapping from the GBIF database",
              gradient: "from-pink-500 to-red-300",
            },
            ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <Card className="glass-morphism p-0 border-white/30 hover:border-white/50 shadow-lg hover:shadow-tropical transition-all duration-500 h-full">
              <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                <motion.div
                className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-full group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                >
                <item.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="font-batik font-semibold text-white mb-3 text-xl">
                {item.title}
                </h3>
                <p className="text-base text-white/80 font-tropical leading-relaxed">
                {item.desc}
                </p>
              </CardContent>
              </Card>
            </motion.div>
            ))}
        </motion.div>

        {/* Cultural footer */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <motion.div
            className="inline-flex items-center gap-2 text-white/80 font-tropical"
            whileHover={{ scale: 1.05 }}
          >
            <Waves className="h-5 w-5 animate-bounce-gentle" />
            <span>Dari Sabang sampai Merauke</span>
            <Waves
              className="h-5 w-5 animate-bounce-gentle"
              style={{ animationDelay: "1s" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
