"""
Seed script for Indigenous Seed Sharing Network.
Populates Neo4j with synthetic but realistic Kenyan farming data.
Run: python seed_data.py
"""
import os
import random
from neo4j import GraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# --- Data ---

COUNTIES = {
    "Machakos": {"lat": -1.52, "lng": 37.26, "climate": "semi_arid", "soil": ["acidic", "sandy"]},
    "Kitui": {"lat": -1.37, "lng": 38.01, "climate": "arid", "soil": ["sandy", "loamy"]},
    "Makueni": {"lat": -1.80, "lng": 37.62, "climate": "semi_arid", "soil": ["sandy", "clay"]},
    "Tharaka-Nithi": {"lat": -0.30, "lng": 37.80, "climate": "sub_humid", "soil": ["volcanic", "loamy"]},
    "Meru": {"lat": 0.05, "lng": 37.65, "climate": "highland", "soil": ["volcanic", "loamy"]},
    "Embu": {"lat": -0.54, "lng": 37.45, "climate": "sub_humid", "soil": ["volcanic", "clay"]},
}

FIRST_NAMES = [
    "Mutua", "Wambua", "Mwikali", "Nduku", "Kioko", "Musyoka", "Kavata", "Mueni",
    "Muthiani", "Nzioki", "Syombua", "Kilonzo", "Mumbua", "Nzisa", "Kyalo", "Mumo",
    "Wayua", "Ngina", "Mwangangi", "Kaluki", "Munyao", "Muthama", "Katuku", "Mbula",
    "Maingi", "Kiio", "Mbithe", "Nthenya", "Wanza", "Mulwa", "Mwenda", "Kagendo",
    "Muriithi", "Karimi", "Njeri", "Muthoni", "Gakuru", "Nyaga", "Ciiru", "Wangari",
]

LAST_NAMES = [
    "Mutiso", "Mwangi", "Kimani", "Ochieng", "Wafula", "Njoroge", "Kamau", "Otieno",
    "Maina", "Kiprop", "Chebet", "Ndirangu", "Musau", "Mutunga", "Kibet", "Wekesa",
    "Muli", "Kathure", "Gitonga", "Mwathi",
]

SEED_VARIETIES = [
    # Sorghum
    {"name": "Gadam Sorghum", "local_name": "Mtama wa Gadam", "crop_type": "Sorghum", "traits": ["drought_resistant", "short_season"], "soil": ["sandy", "loamy"], "climate": ["arid", "semi_arid"]},
    {"name": "Serena Sorghum", "local_name": "Mtama Serena", "crop_type": "Sorghum", "traits": ["drought_resistant", "high_yield"], "soil": ["sandy", "loamy", "clay"], "climate": ["semi_arid", "sub_humid"]},
    {"name": "Seredo Sorghum", "local_name": "Mtama Seredo", "crop_type": "Sorghum", "traits": ["drought_resistant", "pest_resistant"], "soil": ["sandy", "acidic"], "climate": ["arid", "semi_arid"]},
    {"name": "Kari Mtama 1", "local_name": "Mtama wa Nyanya", "crop_type": "Sorghum", "traits": ["short_season", "low_input"], "soil": ["sandy", "loamy"], "climate": ["semi_arid"]},
    {"name": "Mugeta Sorghum", "local_name": "Mtama Mugeta", "crop_type": "Sorghum", "traits": ["drought_resistant", "high_yield", "pest_resistant"], "soil": ["loamy", "volcanic"], "climate": ["semi_arid", "sub_humid"]},
    {"name": "Nyadundo Sorghum", "local_name": "Mtama Nyadundo", "crop_type": "Sorghum", "traits": ["low_input", "pest_resistant"], "soil": ["clay", "loamy"], "climate": ["sub_humid"]},
    # Millet
    {"name": "Kat/PM-1 Pearl Millet", "local_name": "Mwele wa Ukambani", "crop_type": "Millet", "traits": ["drought_resistant", "short_season"], "soil": ["sandy", "acidic"], "climate": ["arid", "semi_arid"]},
    {"name": "Okhale Finger Millet", "local_name": "Wimbi Okhale", "crop_type": "Millet", "traits": ["high_yield", "pest_resistant"], "soil": ["loamy", "volcanic"], "climate": ["sub_humid", "highland"]},
    {"name": "U-15 Finger Millet", "local_name": "Wimbi wa Meru", "crop_type": "Millet", "traits": ["high_yield", "low_input"], "soil": ["volcanic", "loamy"], "climate": ["highland"]},
    {"name": "Katumani Millet", "local_name": "Mwele wa Katumani", "crop_type": "Millet", "traits": ["drought_resistant", "short_season", "low_input"], "soil": ["sandy", "acidic"], "climate": ["arid", "semi_arid"]},
    {"name": "Ikhulule Millet", "local_name": "Wimbi Ikhulule", "crop_type": "Millet", "traits": ["pest_resistant", "high_yield"], "soil": ["loamy", "clay"], "climate": ["sub_humid"]},
    {"name": "Snapping Millet", "local_name": "Wimbi Snapping", "crop_type": "Millet", "traits": ["short_season", "low_input"], "soil": ["sandy", "loamy"], "climate": ["semi_arid", "arid"]},
    # Cowpea
    {"name": "Machakos 66", "local_name": "Nthooko ya Machakos", "crop_type": "Cowpea", "traits": ["drought_resistant", "short_season"], "soil": ["sandy", "loamy"], "climate": ["semi_arid"]},
    {"name": "Katumani 80", "local_name": "Nthooko ya Katumani", "crop_type": "Cowpea", "traits": ["drought_resistant", "high_yield"], "soil": ["sandy", "acidic"], "climate": ["semi_arid", "arid"]},
    {"name": "KVU 27-1", "local_name": "Nthooko Nyekundu", "crop_type": "Cowpea", "traits": ["pest_resistant", "high_yield"], "soil": ["loamy", "volcanic"], "climate": ["sub_humid"]},
    {"name": "Kunde ya Kitui", "local_name": "Nthooko ya Kitui", "crop_type": "Cowpea", "traits": ["drought_resistant", "low_input", "short_season"], "soil": ["sandy", "acidic"], "climate": ["arid"]},
    {"name": "M66 Cowpea", "local_name": "Nthooko M66", "crop_type": "Cowpea", "traits": ["short_season", "high_yield"], "soil": ["loamy", "sandy"], "climate": ["semi_arid", "sub_humid"]},
    # Pigeon Pea
    {"name": "Kat 60/8", "local_name": "Mbaazi ya Katumani", "crop_type": "Pigeon Pea", "traits": ["drought_resistant", "low_input"], "soil": ["sandy", "acidic"], "climate": ["semi_arid", "arid"]},
    {"name": "ICEAP 00040", "local_name": "Mbaazi Mpya", "crop_type": "Pigeon Pea", "traits": ["high_yield", "short_season"], "soil": ["loamy", "clay"], "climate": ["semi_arid", "sub_humid"]},
    {"name": "Mbaazi ya Kitui", "local_name": "Mbaazi ya Kienyeji", "crop_type": "Pigeon Pea", "traits": ["drought_resistant", "pest_resistant", "low_input"], "soil": ["sandy", "acidic"], "climate": ["arid", "semi_arid"]},
    {"name": "KAT 777", "local_name": "Mbaazi 777", "crop_type": "Pigeon Pea", "traits": ["high_yield", "pest_resistant"], "soil": ["loamy", "volcanic"], "climate": ["sub_humid"]},
    # Green Gram
    {"name": "Nylon Green Gram", "local_name": "Ndengu Nylon", "crop_type": "Green Gram", "traits": ["drought_resistant", "short_season"], "soil": ["sandy", "loamy"], "climate": ["semi_arid", "arid"]},
    {"name": "KS20 Green Gram", "local_name": "Ndengu KS20", "crop_type": "Green Gram", "traits": ["high_yield", "short_season"], "soil": ["loamy", "sandy"], "climate": ["semi_arid"]},
    {"name": "Biashara Green Gram", "local_name": "Ndengu Biashara", "crop_type": "Green Gram", "traits": ["high_yield", "pest_resistant"], "soil": ["loamy", "volcanic"], "climate": ["sub_humid", "semi_arid"]},
    {"name": "Uncle Green Gram", "local_name": "Ndengu Uncle", "crop_type": "Green Gram", "traits": ["drought_resistant", "low_input"], "soil": ["sandy", "acidic"], "climate": ["arid"]},
    {"name": "Tosha Green Gram", "local_name": "Ndengu Tosha", "crop_type": "Green Gram", "traits": ["short_season", "pest_resistant"], "soil": ["loamy", "clay"], "climate": ["semi_arid", "sub_humid"]},
    # Traditional Maize
    {"name": "Katumani Composite", "local_name": "Mbemba ya Katumani", "crop_type": "Maize", "traits": ["drought_resistant", "short_season"], "soil": ["sandy", "loamy"], "climate": ["semi_arid"]},
    {"name": "Makueni Local White", "local_name": "Mbemba ya Kienyeji", "crop_type": "Maize", "traits": ["drought_resistant", "low_input"], "soil": ["sandy", "acidic"], "climate": ["semi_arid", "arid"]},
    {"name": "Embu Highland Maize", "local_name": "Mbemba ya Mlima", "crop_type": "Maize", "traits": ["high_yield", "pest_resistant"], "soil": ["volcanic", "loamy"], "climate": ["highland", "sub_humid"]},
    {"name": "Meru Yellow Maize", "local_name": "Mbemba Njano", "crop_type": "Maize", "traits": ["high_yield", "low_input"], "soil": ["volcanic", "loamy"], "climate": ["highland"]},
    {"name": "Tharaka Dry Maize", "local_name": "Mbemba ya Tharaka", "crop_type": "Maize", "traits": ["drought_resistant", "short_season", "low_input"], "soil": ["sandy", "loamy"], "climate": ["semi_arid", "arid"]},
    # Sorghum (more)
    {"name": "Ochuti Sorghum", "local_name": "Mtama Ochuti", "crop_type": "Sorghum", "traits": ["high_yield", "low_input"], "soil": ["clay", "loamy"], "climate": ["sub_humid"]},
    # Additional varieties
    {"name": "Kitui Drought Bean", "local_name": "Maharage ya Kitui", "crop_type": "Cowpea", "traits": ["drought_resistant", "low_input", "pest_resistant"], "soil": ["sandy", "acidic"], "climate": ["arid"]},
    {"name": "Ikombe Sorghum", "local_name": "Mtama wa Ikombe", "crop_type": "Sorghum", "traits": ["drought_resistant", "short_season"], "soil": ["sandy"], "climate": ["arid", "semi_arid"]},
    {"name": "Mwea Pearl Millet", "local_name": "Mwele wa Mwea", "crop_type": "Millet", "traits": ["high_yield", "pest_resistant"], "soil": ["loamy", "clay"], "climate": ["sub_humid"]},
    {"name": "Makueni Ndengu", "local_name": "Ndengu ya Makueni", "crop_type": "Green Gram", "traits": ["drought_resistant", "short_season", "low_input"], "soil": ["sandy", "acidic"], "climate": ["semi_arid", "arid"]},
    {"name": "Kimaa Pigeon Pea", "local_name": "Mbaazi ya Kimaa", "crop_type": "Pigeon Pea", "traits": ["drought_resistant", "short_season"], "soil": ["sandy", "loamy"], "climate": ["arid", "semi_arid"]},
    {"name": "Kangundo Cowpea", "local_name": "Nthooko ya Kangundo", "crop_type": "Cowpea", "traits": ["high_yield", "short_season", "pest_resistant"], "soil": ["loamy", "volcanic"], "climate": ["semi_arid", "sub_humid"]},
    {"name": "Wote Local Millet", "local_name": "Mwele wa Wote", "crop_type": "Millet", "traits": ["drought_resistant", "low_input"], "soil": ["sandy", "acidic"], "climate": ["semi_arid"]},
    {"name": "Tseikuru Sorghum", "local_name": "Mtama wa Tseikuru", "crop_type": "Sorghum", "traits": ["drought_resistant", "low_input", "pest_resistant"], "soil": ["sandy"], "climate": ["arid"]},
]

TRAITS = ["drought_resistant", "short_season", "pest_resistant", "high_yield", "low_input"]
SOILS = ["acidic", "sandy", "loamy", "clay", "volcanic"]
CLIMATES = ["arid", "semi_arid", "sub_humid", "humid", "highland"]


def jitter(val, amount=0.15):
    return val + random.uniform(-amount, amount)


def generate_farmers(count=200):
    farmers = []
    counties = list(COUNTIES.keys())
    for i in range(count):
        county = random.choice(counties)
        info = COUNTIES[county]
        farmers.append({
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "phone": f"07{random.randint(10, 99)}{random.randint(100000, 999999)}",
            "lat": jitter(info["lat"]),
            "lng": jitter(info["lng"]),
            "farm_size_acres": round(random.uniform(0.5, 8.0), 1),
            "county": county,
        })
    return farmers


def seed_database():
    with driver.session() as session:
        # Clear existing data
        session.run("MATCH (n) DETACH DELETE n")
        print("Cleared existing data.")

        # Create constraints
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (f:Farmer) REQUIRE f.phone IS UNIQUE")
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (s:SeedVariety) REQUIRE s.name IS UNIQUE")
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Trait) REQUIRE t.name IS UNIQUE")
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (st:SoilType) REQUIRE st.name IS UNIQUE")
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (cz:ClimateZone) REQUIRE cz.name IS UNIQUE")

        # Create traits
        for t in TRAITS:
            session.run("MERGE (t:Trait {name: $name})", {"name": t})
        print(f"Created {len(TRAITS)} traits.")

        # Create soil types
        for s in SOILS:
            session.run("MERGE (s:SoilType {name: $name})", {"name": s})
        print(f"Created {len(SOILS)} soil types.")

        # Create climate zones
        for c in CLIMATES:
            session.run("MERGE (c:ClimateZone {name: $name})", {"name": c})
        print(f"Created {len(CLIMATES)} climate zones.")

        # Create locations
        for county, info in COUNTIES.items():
            session.run(
                "MERGE (l:Location {county: $county}) SET l.lat = $lat, l.lng = $lng, l.climate = $climate",
                {"county": county, "lat": info["lat"], "lng": info["lng"], "climate": info["climate"]},
            )
        print(f"Created {len(COUNTIES)} locations.")

        # Create seed varieties with relationships
        for sv in SEED_VARIETIES:
            session.run(
                """
                MERGE (s:SeedVariety {name: $name})
                SET s.local_name = $local_name, s.crop_type = $crop_type
                """,
                sv,
            )
            for trait in sv["traits"]:
                session.run(
                    "MATCH (s:SeedVariety {name: $name}), (t:Trait {name: $trait}) MERGE (s)-[:HAS_TRAIT]->(t)",
                    {"name": sv["name"], "trait": trait},
                )
            for soil in sv["soil"]:
                session.run(
                    "MATCH (s:SeedVariety {name: $name}), (st:SoilType {name: $soil}) MERGE (s)-[:THRIVES_IN]->(st)",
                    {"name": sv["name"], "soil": soil},
                )
            for climate in sv["climate"]:
                session.run(
                    "MATCH (s:SeedVariety {name: $name}), (cz:ClimateZone {name: $climate}) MERGE (s)-[:SUITED_FOR]->(cz)",
                    {"name": sv["name"], "climate": climate},
                )
        print(f"Created {len(SEED_VARIETIES)} seed varieties.")

        # Create farmers
        farmers = generate_farmers(200)
        for f in farmers:
            session.run(
                """
                CREATE (f:Farmer {name: $name, phone: $phone, lat: $lat, lng: $lng, farm_size_acres: $farm_size_acres})
                WITH f
                MATCH (l:Location {county: $county})
                MERGE (f)-[:LOCATED_IN]->(l)
                """,
                f,
            )
        print(f"Created {len(farmers)} farmers.")

        # Assign seeds to farmers (each farmer grows 1-4 varieties suited to their county)
        for f in farmers:
            county_info = COUNTIES[f["county"]]
            suitable = [
                sv for sv in SEED_VARIETIES
                if any(c in sv["climate"] for c in [county_info["climate"]])
                and any(s in sv["soil"] for s in county_info["soil"])
            ]
            if not suitable:
                suitable = SEED_VARIETIES[:5]
            grown = random.sample(suitable, min(random.randint(1, 4), len(suitable)))
            for sv in grown:
                since_year = random.randint(1985, 2023)
                success = round(random.uniform(3.0, 5.0), 1)
                session.run(
                    """
                    MATCH (f:Farmer {phone: $phone}), (s:SeedVariety {name: $seed})
                    MERGE (f)-[:GROWS {since_year: $since_year, success_rating: $success}]->(s)
                    """,
                    {"phone": f["phone"], "seed": sv["name"], "since_year": since_year, "success": success},
                )
        print("Assigned seed varieties to farmers.")

        # Create provenance chains (RECEIVED_FROM relationships)
        # Group farmers by county, create 15-20 provenance chains
        county_farmers = {}
        for f in farmers:
            county_farmers.setdefault(f["county"], []).append(f)

        chains_created = 0
        for county, cfs in county_farmers.items():
            num_chains = random.randint(3, 5)
            for _ in range(num_chains):
                chain_len = random.randint(3, 7)
                if len(cfs) < chain_len:
                    continue
                chain = random.sample(cfs, chain_len)
                for i in range(1, len(chain)):
                    year = random.randint(1985, 2020)
                    session.run(
                        """
                        MATCH (receiver:Farmer {phone: $receiver_phone}),
                              (source:Farmer {phone: $source_phone})
                        MERGE (receiver)-[:RECEIVED_FROM {year: $year, source_type: 'farmer'}]->(source)
                        """,
                        {
                            "receiver_phone": chain[i]["phone"],
                            "source_phone": chain[i - 1]["phone"],
                            "year": year,
                        },
                    )
                chains_created += 1
        print(f"Created {chains_created} provenance chains.")

        # Create sharing events (SHARED_WITH)
        shares_created = 0
        for county, cfs in county_farmers.items():
            num_shares = random.randint(10, 20)
            for _ in range(num_shares):
                if len(cfs) < 2:
                    continue
                pair = random.sample(cfs, 2)
                year = random.randint(2015, 2025)
                qty = round(random.uniform(0.5, 10.0), 1)
                session.run(
                    """
                    MATCH (a:Farmer {phone: $from_phone}), (b:Farmer {phone: $to_phone})
                    MERGE (a)-[:SHARED_WITH {year: $year, quantity_kg: $qty}]->(b)
                    """,
                    {"from_phone": pair[0]["phone"], "to_phone": pair[1]["phone"], "year": year, "qty": qty},
                )
                shares_created += 1
        print(f"Created {shares_created} sharing events.")

        # Create spatial index for proximity queries
        session.run("CREATE POINT INDEX IF NOT EXISTS FOR (f:Farmer) ON (f.location)")
        print("Done! Database seeded successfully.")


if __name__ == "__main__":
    seed_database()
    driver.close()
