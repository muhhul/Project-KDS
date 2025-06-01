// Mock data for phylogenetic tree
export const mockPhylogeneticData = {
  name: "Root",
  children: [
    {
      name: "Mammals",
      children: [
        {
          name: "Carnivores",
          children: [
            { name: "Panthera tigris sumatrae" },
            { name: "Helarctos malayanus" },
            { name: "Prionailurus bengalensis" },
          ],
        },
        {
          name: "Primates",
          children: [{ name: "Pongo pygmaeus" }, { name: "Hylobates moloch" }, { name: "Nasalis larvatus" }],
        },
      ],
    },
    {
      name: "Birds",
      children: [
        {
          name: "Passerines",
          children: [{ name: "Gracula religiosa" }, { name: "Copsychus malabaricus" }],
        },
        {
          name: "Non-passerines",
          children: [{ name: "Rhyticeros undulatus" }, { name: "Buceros rhinoceros" }],
        },
      ],
    },
    {
      name: "Reptiles",
      children: [{ name: "Varanus komodoensis" }, { name: "Python reticulatus" }, { name: "Crocodylus porosus" }],
    },
  ],
}

// Mock data for species locations on the map
export const mockSpeciesLocations = [
  {
    name: "Sumatran Tiger",
    scientificName: "Panthera tigris sumatrae",
    description: "Critically endangered tiger subspecies native to Sumatra.",
    latitude: 0.7893,
    longitude: 101.3229,
  },
  {
    name: "Orangutan",
    scientificName: "Pongo pygmaeus",
    description: "Great ape native to Indonesia and Malaysia.",
    latitude: 0.5387,
    longitude: 114.0579,
  },
  {
    name: "Komodo Dragon",
    scientificName: "Varanus komodoensis",
    description: "The largest living lizard species, found in Indonesia.",
    latitude: -8.5856,
    longitude: 119.4455,
  },
  {
    name: "Javan Rhinoceros",
    scientificName: "Rhinoceros sondaicus",
    description: "Critically endangered rhino species found in Java.",
    latitude: -6.7487,
    longitude: 105.3845,
  },
  {
    name: "Bali Starling",
    scientificName: "Leucopsar rothschildi",
    description: "Critically endangered bird endemic to Bali.",
    latitude: -8.2422,
    longitude: 114.9425,
  },
  {
    name: "Proboscis Monkey",
    scientificName: "Nasalis larvatus",
    description: "Endemic to Borneo, known for its distinctive nose.",
    latitude: -1.5901,
    longitude: 113.4658,
  },
  {
    name: "Sulawesi Bear Cuscus",
    scientificName: "Ailurops ursinus",
    description: "Marsupial endemic to Sulawesi.",
    latitude: -1.8029,
    longitude: 120.5279,
  },
  {
    name: "Bird of Paradise",
    scientificName: "Paradisaea apoda",
    description: "Exotic bird found in Papua.",
    latitude: -4.2676,
    longitude: 138.0761,
  },
]
