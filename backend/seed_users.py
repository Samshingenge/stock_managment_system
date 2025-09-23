"""
Seed script to add demo users to the database
"""
import sys
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_users():
    """Add demo users to the database"""
    db = SessionLocal()

    try:
        # Check if users already exist
        existing_users = db.query(User).all()
        if existing_users:
            print("Users already exist in the database. Skipping seed.")
            return

        # Demo users data
        demo_users = [
            {
                "username": "admin",
                "email": "admin@stockmanagement.com",
                "full_name": "System Administrator",
                "hashed_password": pwd_context.hash("admin123"),
                "role": "admin",
                "active": True,
            },
            {
                "username": "user",
                "email": "user@stockmanagement.com",
                "full_name": "Stock User",
                "hashed_password": pwd_context.hash("user123"),
                "role": "user",
                "active": True,
            },
            {
                "username": "viewer",
                "email": "viewer@stockmanagement.com",
                "full_name": "Stock Viewer",
                "hashed_password": pwd_context.hash("viewer123"),
                "role": "viewer",
                "active": True,
            }
        ]

        # Add users to database
        for user_data in demo_users:
            user = User(**user_data)
            db.add(user)
            print(f"Added user: {user_data['username']} ({user_data['role']})")

        db.commit()
        print(f"\n✅ Successfully seeded {len(demo_users)} demo users!")

        # Display credentials
        print("\n🔐 Demo Credentials:")
        print("Admin: admin / admin123")
        print("User: user / user123")
        print("Viewer: viewer / viewer123")

    except Exception as e:
        print(f"❌ Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding demo users...")
    seed_users()