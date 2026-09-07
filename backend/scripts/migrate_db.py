import sys
import os

sys.path.insert(0, os.getcwd())

from app.database import Base, engine
import app.models
from sqlalchemy import text, inspect

def run_migration():
    print("Ensuring all tables exist...")
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print("Existing tables:", tables)

        if "users" in tables:
            cols = [c["name"] for c in inspector.get_columns("users")]
            print("Existing columns in 'users':", cols)

            if "hashed_password" not in cols:
                print("Adding 'hashed_password' column to users...")
                conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"))
            
            if "role" not in cols:
                print("Adding 'role' column to users...")
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(32) DEFAULT 'athlete'"))

            if "is_active" not in cols:
                print("Adding 'is_active' column to users...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))

            conn.commit()

            updated_cols = [c["name"] for c in inspect(engine).get_columns("users")]
            print("Updated columns in 'users':", updated_cols)

    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
