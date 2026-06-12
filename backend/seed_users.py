"""Seed test users in Postgres. Run after init_db.py."""
from app.postgres import SessionLocal
from app.models import User
from app.auth import hash_password

USERS = [
    {"phone": "+254700000001", "password": "test1234", "role": "farmer", "neo4j_node_id": "farmer-001"},
    {"phone": "+254700000002", "password": "test1234", "role": "farmer", "neo4j_node_id": "farmer-002"},
    {"phone": "+254700000003", "password": "test1234", "role": "extension_worker", "neo4j_node_id": "farmer-003"},
    {"phone": "+254700000004", "password": "test1234", "role": "institution"},
    {"phone": "+254700000005", "password": "test1234", "role": "admin"},
]

def seed():
    db = SessionLocal()
    for u in USERS:
        if not db.query(User).filter(User.phone == u["phone"]).first():
            user = User(
                phone=u["phone"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                neo4j_node_id=u.get("neo4j_node_id"),
            )
            db.add(user)
            print(f"  Created {u['role']}: {u['phone']}")
    db.commit()
    db.close()
    print("Done. Login with any phone above + password: test1234")

if __name__ == "__main__":
    seed()
