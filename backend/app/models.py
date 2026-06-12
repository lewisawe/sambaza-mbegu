import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.postgres import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    api_key: Mapped[str] = mapped_column(String(64), unique=True, nullable=True)
    neo4j_node_id: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    flagged_reason: Mapped[str] = mapped_column(Text, nullable=True)


class SearchLog(Base):
    __tablename__ = "search_logs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    query_crop: Mapped[str] = mapped_column(String(50), nullable=True)
    query_trait: Mapped[str] = mapped_column(String(50), nullable=True)
    query_county: Mapped[str] = mapped_column(String(50), nullable=True)
    query_lat: Mapped[float] = mapped_column(Float, nullable=True)
    query_lng: Mapped[float] = mapped_column(Float, nullable=True)
    results_count: Mapped[int] = mapped_column(Integer, nullable=True)
    searched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    recipient_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[str] = mapped_column(String(10), default="sms")
    sent: Mapped[bool] = mapped_column(Boolean, default=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100), nullable=True)
    endpoint: Mapped[str] = mapped_column(String(200), nullable=True)
    blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
