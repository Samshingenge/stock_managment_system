#!/usr/bin/env python3
"""
Test script to validate database connection
"""
import sys
import os
sys.path.append('backend')

from app.database import check_db_connection, get_db_info, log_environment_info
from app.config import settings

def test_database_connection():
    """Test database connection and report results"""
    print("=== DATABASE CONNECTION TEST ===")

    # Log environment info
    log_environment_info()

    # Test connection
    print("\n=== TESTING CONNECTION ===")
    is_connected = check_db_connection()

    if is_connected:
        print("✅ Database connection successful!")

        # Get database info
        print("\n=== DATABASE INFO ===")
        try:
            info = get_db_info()
            for key, value in info.items():
                print(f"{key}: {value}")
        except Exception as e:
            print(f"❌ Failed to get database info: {e}")
    else:
        print("❌ Database connection failed!")
        return False

    return True

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)