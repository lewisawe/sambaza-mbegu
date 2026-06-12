from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.postgres import get_db
from app.models import User
from app.auth import hash_password, verify_password, create_token

router = APIRouter()

VALID_ROLES = {"farmer", "extension_worker", "institution", "seed_company", "admin"}


class RegisterRequest(BaseModel):
    phone: str
    password: str
    role: str = "farmer"


class LoginRequest(BaseModel):
    phone: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    role: str


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if req.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {VALID_ROLES}")
    if db.query(User).filter(User.phone == req.phone).first():
        raise HTTPException(status_code=409, detail="Phone already registered")
    user = User(phone=req.phone, password_hash=hash_password(req.password), role=req.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(token=create_token(user.id, user.role), user_id=user.id, role=user.role)


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AuthResponse(token=create_token(user.id, user.role), user_id=user.id, role=user.role)
