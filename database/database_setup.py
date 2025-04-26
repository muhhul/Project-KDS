from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Species, Geographic_Locations, DNA_Sequence, species_locations
from datetime import datetime

engine = create_engine('sqlite:///biodiversity.db', echo=False)
Session = sessionmaker(bind=engine)
session = Session()

Base.metadata.create_all(engine)

species_data = [
    {"scientific_name": "Nisaetus bartelsi", "common_name": "Elang Jawa", "family": "Accipitridae", "description": "Burung elang endemik Jawa, terancam punah."},
    {"scientific_name": "Panthera tigris sumatrae", "common_name": "Harimau Sumatera", "family": "Felidae", "description": "Kucing besar endemik Sumatera, kritis."},
    {"scientific_name": "Pongo pygmaeus", "common_name": "Orangutan Kalimantan", "family": "Hominidae", "description": "Primata endemik Kalimantan, terancam."},
    {"scientific_name": "Rhinoceros sondaicus", "common_name": "Badak Jawa", "family": "Rhinocerotidae", "description": "Mamalia besar terancam punah di Jawa."},
    {"scientific_name": "Dicerorhinus sumatrensis", "common_name": "Badak Sumatera", "family": "Rhinocerotidae", "description": "Badak kecil endemik Sumatera, kritis."},
    {"scientific_name": "Probosciger aterrimus", "common_name": "Kakatua Raja", "family": "Cacatuidae", "description": "Burung kakatua besar endemik Papua."},
    {"scientific_name": "Tarsius tarsier", "common_name": "Tarsius Sulawesi", "family": "Tarsiidae", "description": "Primata kecil endemik Sulawesi."},
    {"scientific_name": "Cacatua sulphurea", "common_name": "Kakatua Jambul Kuning", "family": "Cacatuidae", "description": "Kakatua endemik Sulawesi dan Nusa Tenggara."},
    {"scientific_name": "Bos javanicus", "common_name": "Banteng Jawa", "family": "Bovidae", "description": "Sapi liar endemik Jawa, terancam."},
    {"scientific_name": "Varanus komodoensis", "common_name": "Komodo", "family": "Varanidae", "description": "Kadal terbesar di dunia, endemik Nusa Tenggara."}
]

locations_data = [
    {"latitude": -6.7527, "longitude": 106.7314, "location_name": "Taman Nasional Gunung Halimun-Salak", "source": "GBIF", "observation_date": datetime(2020, 1, 15)},
    {"latitude": -6.8033, "longitude": 106.9905, "location_name": "Taman Nasional Gede Pangrango", "source": "GBIF", "observation_date": datetime(2021, 3, 22)},
    {"latitude": 3.5894, "longitude": 98.6722, "location_name": "Taman Nasional Gunung Leuser", "source": "GBIF", "observation_date": datetime(2019, 7, 10)},
    {"latitude": 1.2596, "longitude": 114.8186, "location_name": "Taman Nasional Tanjung Puting", "source": "GBIF", "observation_date": datetime(2021, 6, 18)},
    {"latitude": -7.8014, "longitude": 110.5041, "location_name": "Taman Nasional Ujung Kulon", "source": "GBIF", "observation_date": datetime(2022, 2, 14)},
    {"latitude": 4.9530, "longitude": 97.3152, "location_name": "Aceh", "source": "GBIF", "observation_date": datetime(2020, 9, 9)},
    {"latitude": -2.3456, "longitude": 140.5167, "location_name": "Jayapura, Papua", "source": "GBIF", "observation_date": datetime(2021, 8, 25)},
    {"latitude": -0.8613, "longitude": 119.9213, "location_name": "Taman Nasional Lore Lindu", "source": "GBIF", "observation_date": datetime(2021, 12, 3)},
    {"latitude": -8.4667, "longitude": 117.4333, "location_name": "Pulau Komodo, Taman Nasional Komodo", "source": "GBIF", "observation_date": datetime(2020, 5, 10)},
    {"latitude": -7.3167, "longitude": 110.1833, "location_name": "Taman Nasional Baluran", "source": "GBIF", "observation_date": datetime(2021, 9, 12)}
]

dna_sequences_data = [
    {
        "scientific_name": "Nisaetus bartelsi",
        "genbank_accession": "MT158243.1",
        "gene": "COX1",
        "sequence": "ggcatagttggcaccgcccttagcctacttatccgcgcagaactcggccaaccgggtaccctactgggcgatgaccaaatctacaatgtagtcgtcactgcccatgctttcgtaataatcttcttcatagtcataccaatcataatcggaggctttggaaactgacttgtcccactcataatcggcgcccctgacatagccttcccacgcataaacaacataagcttctgactacttcccccatccttcctcctactagcctcttcaacagtagaagccggggctggcaccggatgaacggtctatcccccactagctggcaacatagcccatgctggcgcctcagtagacttggccatcttttctctacatctagcaggaatctcatccatcttaggggcaattaacttcatcacgaccgctattaacataaaacctccagccctctctcaataccaaacacccctattcgtctgatctgtactcatcaccgctgtcctactactactctcactcccgtcctagctgccggcattactatgctactcacagaccgaaacctcaacacaacattcttcgaccccgccggcggcggtgacccagtcctgtaccaacacctct",
        "length_bp": 625,
        "source": "NCBI"
    },
    {
        "scientific_name": "Panthera tigris sumatrae",
        "genbank_accession": "KF564297.1",
        "gene": "COX1",
        "sequence": "atgtt...",
        "length_bp": 658,
        "source": "NCBI"
    },
    {
        "scientific_name": "Pongo pygmaeus",
        "genbank_accession": "NC_021769.1",
        "gene": "COX1",
        "sequence": "ggtat...",
        "length_bp": 681,
        "source": "NCBI"
    },
    {
        "scientific_name": "Rhinoceros sondaicus",
        "genbank_accession": "JX914863.1",
        "gene": "COX1",
        "sequence": "tgcga...",
        "length_bp": 655,
        "source": "NCBI"
    },
    {
        "scientific_name": "Dicerorhinus sumatrensis",
        "genbank_accession": "FJ347896.1",
        "gene": "COX1",
        "sequence": "agtcc...",
        "length_bp": 672,
        "source": "NCBI"
    },
    {
        "scientific_name": "Probosciger aterrimus",
        "genbank_accession": "KM096453.1",
        "gene": "COX1",
        "sequence": "cgtag...",
        "length_bp": 694,
        "source": "NCBI"
    },
    {
        "scientific_name": "Tarsius tarsier",
        "genbank_accession": "EU784123.1",
        "gene": "COX1",
        "sequence": "agctg...",
        "length_bp": 657,
        "source": "NCBI"
    },
    {
        "scientific_name": "Cacatua sulphurea",
        "genbank_accession": "DQ123456.1",
        "gene": "COX1",
        "sequence": "gctaa...",
        "length_bp": 709,
        "source": "NCBI"
    },
    {
        "scientific_name": "Bos javanicus",
        "genbank_accession": "AF497803.1",
        "gene": "ND2",
        "sequence": "ttagc...",
        "length_bp": 1041,
        "source": "NCBI"
    },
    {
        "scientific_name": "Varanus komodoensis",
        "genbank_accession": "MK628540.1",
        "gene": "COX1",
        "sequence": "cctag...",
        "length_bp": 680,
        "source": "NCBI"
    }
]

species_locations_data = [
    (1, 1),  
    (1, 2),  
    (2, 3),  
    (3, 4),  
    (4, 5),  
    (5, 3),  
    (5, 6), 
    (6, 7),  
    (7, 8),  
    (9, 10), 
    (9, 5), 
    (10, 9), 
]

for data in species_data:
    existing = session.query(Species).filter_by(scientific_name=data["scientific_name"]).first()
    if not existing:
        session.add(Species(**data))
session.commit()

for data in locations_data:
    existing = session.query(Geographic_Locations).filter_by(location_name=data["location_name"]).first()
    if not existing:
        session.add(Geographic_Locations(**data))
session.commit()

for data in dna_sequences_data:
    existing = session.query(DNA_Sequence).filter_by(genbank_accession=data["genbank_accession"]).first()
    if not existing:
        species = session.query(Species).filter_by(scientific_name=data["scientific_name"]).first()
        if species:
            data_copy = data.copy()
            data_copy["species_id"] = species.id
            del data_copy["scientific_name"]
            session.add(DNA_Sequence(**data_copy))
session.commit()

for species_id, location_id in species_locations_data:
    existing = session.query(species_locations).filter_by(species_id=species_id, location_id=location_id).first()
    if not existing:
        session.execute(species_locations.insert().values(species_id=species_id, location_id=location_id))
session.commit()

print("Species:")
for species in session.query(Species).all():
    print(f"{species.scientific_name}: {species.common_name}")

print("\nLocations:")
for location in session.query(Geographic_Locations).all():
    print(f"{location.location_name}: ({location.latitude}, {location.longitude})")

print("\nDNA Sequences:")
for seq in session.query(DNA_Sequence).all():
    print(f"{seq.genbank_accession}: {seq.gene}, {seq.length_bp} bp")

print("\nSpecies-Locations:")
for sl in session.query(species_locations).all():
    species = session.query(Species).filter_by(id=sl.species_id).first()
    location = session.query(Geographic_Locations).filter_by(id=sl.location_id).first()
    print(f"{species.scientific_name} di {location.location_name}")

session.close()