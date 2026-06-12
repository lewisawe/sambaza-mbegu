from app.postgres import engine, Base
from app.models import User, SearchLog, Alert, AuditLog  # noqa: F401

def init():
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

if __name__ == "__main__":
    init()
