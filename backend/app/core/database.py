from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create the SQLAlchemy engine
# Ensure PostgreSQL uses psycopg2 dialect
database_url = settings.DATABASE_URL
print(f"Database URL (raw): {database_url}")  # Debug print

# Fix Render PostgreSQL hostname if missing suffix (common issue)
if "postgresql" in database_url and "@" in database_url:
    scheme_part, rest_part = database_url.split("://", 1)
    user_pass_part, host_part = rest_part.split("@", 1)
    # Check if host is missing the Render domain suffix
    if "." not in host_part.split(":")[0]:  # No dots in hostname (ignoring port)
        # Add the region-specific suffix (ohio)
        hostname = host_part.split(":")[0]
        port_part = host_part.split(":", 1)[1] if ":" in host_part else ""
        fixed_host = f"{hostname}.ohio-postgres.render.com"
        if port_part:
            fixed_host += f":{port_part}"
        database_url = f"{scheme_part}://{user_pass_part}@{fixed_host}"
        print(f"Fixed database URL (raw): {database_url}")

# Mask password for logging
if "://" in database_url and "@" in database_url:
    scheme, rest = database_url.split("://", 1)
    userinfo, hostinfo = rest.split("@", 1)
    if ":" in userinfo:
        username, password = userinfo.split(":", 1)
        masked_url = f"{scheme}://{username}:****@{hostinfo}"
    else:
        masked_url = f"{scheme}://{userinfo}@{hostinfo}"
    print(f"Database URL (masked): {masked_url}")

if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False  # Required for SQLite
engine = create_engine(
    database_url, connect_args=connect_args, pool_pre_ping=True  # Added pool_pre_ping to check connections
)

# Create a session local class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative models
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
