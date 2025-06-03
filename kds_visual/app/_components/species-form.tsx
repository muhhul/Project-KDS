"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Sparkles, Leaf } from "lucide-react"

import animalsDataRaw from "@/public/animals.json";

interface Animal {
  Provinsi: string;
  "Nama Umum": string;
  "Nama Latin": string;
  "Taxonomy name": string;
  Video: string;
  "Deskripsi Singkat": string;
}

const animalsData: Animal[] = animalsDataRaw as Animal[];

interface SpeciesFormProps {
  onAnalysisComplete: (species: string) => void
}

export default function SpeciesForm({ onAnalysisComplete }: SpeciesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [species, setSpecies] = useState("")
  const [error, setError] = useState("")

  const [suggestions, setSuggestions] = useState<Animal[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1); 

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSpecies(inputValue);
    setError("");

    if (inputValue.trim().length >= 1) {
      const filteredSuggestions = animalsData.filter(animal =>
        animal["Taxonomy name"].toLowerCase().includes(inputValue.toLowerCase()) ||
        animal["Nama Umum"].toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
      setActiveIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (selectedAnimal: Animal) => {
    setSpecies(selectedAnimal["Taxonomy name"]);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(""); 
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSuggestionClick(suggestions[activeIndex]);
        } else if (suggestions.length === 1) {
            handleSuggestionClick(suggestions[0]);
        } else {
             setShowSuggestions(false);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setShowSuggestions(false);

    const trimmedSpecies = species.trim();

    if (!trimmedSpecies) {
      setError("Please enter a species name.")
      return
    }
    if (trimmedSpecies.length < 2) {
      setError("Species name must be at least 2 characters.")
      return
    }

    const isValidSpecies = animalsData.some(
      animal => animal["Taxonomy name"].toLowerCase() === trimmedSpecies.toLowerCase()
    );

    if (!isValidSpecies) {
      setError("Invalid species. Please select a species from the suggestions or enter a known 'Taxonomy name'.");
      return;
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onAnalysisComplete(trimmedSpecies)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="glass-morphism border-white/30 pt-0 shadow-tropical hover:shadow-glow transition-all duration-700">
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
                <h2 className="text-2xl font-batik font-bold text-white">Species Analysis</h2>
              </motion.div>
              <p className="text-white/80 font-tropical">Enter the scientific name of the species for phylogenetic analysis</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4 relative"> 
                <Label className="text-lg font-batik font-semibold text-white flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-tropical-green" />
                  Species Name
                </Label>
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} ref={formRef}>
                  <Input
                    type="text"
                    placeholder="e.g.: Argusianus argus or Kuau Raja"
                    value={species}
                    onChange={handleInputChange}
                    onFocus={() => { 
                        if (species.trim().length >=2 && suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full h-14 text-lg border-2 border-white/30 focus:border-batik-gold bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder:text-white/60 font-tropical transition-all duration-300 focus:shadow-glow"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </motion.div>
                {showSuggestions && suggestions.length > 0 && !isLoading && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-20 md:max-w-7xl w-full mt-1 bg-slate-700/40 backdrop-blur-md border border-white/20 rounded-lg shadow-xl overflow-clip max-h-60 overflow-y-auto"
                    style={{ top: "100%" }} 
                  >
                    {suggestions.map((animal, index) => (
                      <li
                        key={animal["Nama Latin"] + index}
                        className={`px-4 py-3 text-white/90 hover:bg-amber-400/30 cursor-pointer font-tropical text-sm transition-colors duration-150 ${index === activeIndex ? "bg-batik-gold/40" : ""}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            handleSuggestionClick(animal);
                        }}
                      >
                        <span className="font-semibold">{animal["Taxonomy name"]}</span>
                        <span className="text-xs text-white/70 ml-2">({animal["Nama Umum"]})</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
                <p className="text-white/70 font-tropical text-sm">
                  Enter the scientific name or common name to search. Select a "Taxonomy name".
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
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6" />
                          Analyze Species
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