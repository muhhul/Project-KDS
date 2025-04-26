from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Species, Geographic_Locations, DNA_Sequence, species_locations

engine = create_engine('sqlite:///biodiversity.db', echo=False)
Session = sessionmaker(bind=engine)
session = Session()

print("Daftar Semua Spesies:")
species_list = session.query(Species).all()
for species in species_list:
    print(f"ID: {species.id}, Scientific Name: {species.scientific_name}, Common Name: {species.common_name}")

print("\nSekuens DNA untuk Nisaetus bartelsi:")
species = session.query(Species).filter_by(scientific_name="Nisaetus bartelsi").first()
if species:
    sequences = session.query(DNA_Sequence).filter_by(species_id=species.id).all()
    for seq in sequences:
        print(f"Accession: {seq.genbank_accession}, Gene: {seq.gene}, Length: {seq.length_bp} bp, Sequence (first 50 bp): {seq.sequence[:50]}...")

print("\nSpesies di Gunung Halimun-Salak National Park:")
location = session.query(Geographic_Locations).filter_by(location_name="Gunung Halimun-Salak National Park").first()
if location:
    for species in location.species:
        print(f"Scientific Name: {species.scientific_name}, Common Name: {species.common_name}")

print("\nLokasi untuk Rhinoceros sondaicus:")
species = session.query(Species).filter_by(scientific_name="Rhinoceros sondaicus").first()
if species:
    for location in species.locations:
        print(f"Location: {location.location_name}, Coordinates: ({location.latitude}, {location.longitude})")

print("\nJumlah Spesies per Lokasi:")
locations = session.query(Geographic_Locations).all()
for location in locations:
    species_count = len(location.species)
    print(f"Location: {location.location_name}, Species Count: {species_count}")

session.close()