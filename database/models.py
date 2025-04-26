from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

species_locations = Table(
    'species_locations',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('species_id', Integer, ForeignKey('species.id')),
    Column('location_id', Integer, ForeignKey('geographic_locations.id'))
)

class Species(Base):
    __tablename__ = 'species'
    id = Column(Integer, primary_key=True)
    scientific_name = Column(String(100), unique=True, nullable=False)
    common_name = Column(String(100))
    family = Column(String(50))
    description = Column(Text)
    date_added = Column(DateTime, default=datetime.utcnow)
    locations = relationship('Geographic_Locations', secondary=species_locations, back_populates='species')
    dna_sequences = relationship('DNA_Sequence', back_populates='species')

class Geographic_Locations(Base):
    __tablename__ = 'geographic_locations'
    id = Column(Integer, primary_key=True)
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String(100))
    source = Column(String(100))
    observation_date = Column(DateTime)
    species = relationship('Species', secondary=species_locations, back_populates='locations')

class DNA_Sequence(Base):
    __tablename__ = 'dna_sequences'
    id = Column(Integer, primary_key=True)
    species_id = Column(Integer, ForeignKey('species.id'), nullable=False)
    genbank_accession = Column(String(20), unique=True, nullable=False)
    gene = Column(String(50))
    sequence = Column(Text, nullable=False)
    length_bp = Column(Integer)
    source = Column(String(100))
    date_updated = Column(DateTime, default=datetime.utcnow)
    species = relationship('Species', back_populates='dna_sequences')