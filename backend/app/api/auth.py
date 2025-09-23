"""
Authentication endpoints for Stock Management System
"""
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User as UserModel

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    role: str | None = None
    active: bool | None = None


class ApiResponse(BaseModel):
    success: bool
    data: dict | None = None
    message: str
    errors: list | None = None
    metadata: dict | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict


class UserInDB(User):
    hashed_password: str


def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Hash a password"""
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    """Get user from database"""
    return db.query(UserModel).filter(UserModel.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user with username and password"""
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
):
    """Get current active user"""
    if not current_user.active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/token", response_model=ApiResponse)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """Login endpoint to get access token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        return ApiResponse(
            success=False,
            data=None,
            message="Incorrect username or password",
            errors=[{
                "field": "credentials",
                "message": "Invalid username or password",
                "code": "INVALID_CREDENTIALS"
            }],
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": "login_" + str(datetime.utcnow().timestamp())
            }
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    token_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

    return ApiResponse(
        success=True,
        data=token_data,
        message="Login successful",
        errors=None,
        metadata={
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": "login_" + str(datetime.utcnow().timestamp())
        }
    )


@router.get("/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user


@router.post("/refresh", response_model=ApiResponse)
async def refresh_token(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )

    token_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

    return ApiResponse(
        success=True,
        data=token_data,
        message="Token refreshed successfully",
        errors=None,
        metadata={
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": "refresh_" + str(datetime.utcnow().timestamp())
        }
    )


@router.post("/logout", response_model=ApiResponse)
async def logout(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Logout endpoint (client should discard token)"""
    return ApiResponse(
        success=True,
        data=None,
        message="Successfully logged out",
        errors=None,
        metadata={
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": "logout_" + str(datetime.utcnow().timestamp())
        }
    )


@router.get("/validate", response_model=ApiResponse)
async def validate_token(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Validate current token and return user info"""
    return ApiResponse(
        success=True,
        data={"valid": True, "user": {
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role
        }},
        message="Token is valid",
        errors=None,
        metadata={
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": "validate_" + str(datetime.utcnow().timestamp())
        }
    )


# Dependency for protected routes
def get_current_user_dependency():
    """Dependency for routes that require authentication"""
    return None
