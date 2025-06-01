"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Sparkles, Leaf } from "lucide-react"

interface SpeciesFormProps {
  onAnalysisComplete: (species: string) => void
}

export default function SpeciesForm({ onAnalysisComplete }: SpeciesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [species, setSpecies] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Reset error
    setError("")

    // Validate input
    if (!species.trim()) {
      setError("Masukkan nama spesies yang valid.")
      return
    }

    if (species.trim().length < 2) {
      setError("Nama spesies harus minimal 2 karakter.")
      return
    }

    setIsLoading(true)

    // Simulate processing time with Indonesian flair
    setTimeout(() => {
      setIsLoading(false)
      onAnalysisComplete(species.trim())
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="glass-morphism border-white/30 pt-0 shadow-tropical hover:shadow-glow transition-all duration-700 overflow-hidden">
        {/* Decorative header with batik pattern */}
        <div className="h-5 ocean-gradient" />

        <CardContent className="pt-10 pb-10 px-8 relative">
          <div className="absolute inset-0 batik-pattern opacity-10" />

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-3 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="p-3 bg-amber-300/20 backdrop-blur-sm rounded-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <Search className="h-6 w-6 text-batik-gold" />
                </motion.div>
                <h2 className="text-2xl font-batik font-bold text-white">Analisis Spesies</h2>
              </motion.div>
              <p className="text-white/80 font-tropical">Masukkan nama ilmiah spesies untuk analisis filogenetik</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-batik font-semibold text-white flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-tropical-green" />
                  Nama Spesies
                </Label>
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Input
                    type="text"
                    placeholder="contoh: Panthera tigris sumatrae"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full h-14 text-lg border-2 border-white/30 focus:border-batik-gold bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder:text-white/60 font-tropical transition-all duration-300 focus:shadow-glow"
                    disabled={isLoading}
                  />
                </motion.div>
                <p className="text-white/70 font-tropical text-sm">
                  Masukkan nama ilmiah spesies yang ingin Anda analisis.
                </p>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-coral-pink font-tropical text-sm"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="cursor-pointer"
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="sunset-gradient hover:shadow-glow cursor-pointer text-white px-10 py-4 rounded-xl shadow-sunset transition-all duration-500 text-lg font-tropical font-semibold border-0 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    <div className="relative z-10 flex items-center">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Menganalisis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6" />
                          Analisis Spesies
                        </>
                      )}
                    </div>
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
