from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException as FastAPIHTTPException
from pydantic import ValidationError

from .core.config import settings
from .core.database import engine
from .models.db_models import Base
from .models.common import ErrorResponse
from .api.v1 import auth, deals, users, disputes, wallets, webhooks

# Create database tables
try:
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
except Exception as e:
    print(f"Failed to create database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Frontend origins from config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    error_code = f"HTTP_{exc.status_code}"
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.detail if isinstance(exc.detail, str) else "An error occurred",
            error_code=error_code,
            details=exc.detail if isinstance(exc.detail, dict) else None
        ).model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Format validation errors nicely
    errors = {}
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"] if loc != "body")
        errors[field] = err["msg"]
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            message="Validation failed",
            error_code="VALIDATION_ERROR",
            details=errors
        ).model_dump()
    )


@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    errors = {}
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"])
        errors[field] = err["msg"]
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            message="Validation failed",
            error_code="VALIDATION_ERROR",
            details=errors
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # In production, you'd log this properly
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            message="An unexpected error occurred",
            error_code="INTERNAL_SERVER_ERROR"
        ).model_dump()
    )


@app.get("/")
def root():
    return {"message": "Welcome to LockPay API!", "version": settings.VERSION}


app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(deals.router, prefix=f"{settings.API_V1_STR}/deals", tags=["deals"])
app.include_router(disputes.router, prefix=f"{settings.API_V1_STR}/disputes", tags=["disputes"])
app.include_router(wallets.router, prefix=f"{settings.API_V1_STR}/wallets", tags=["wallets"])
app.include_router(webhooks.router, prefix=f"{settings.API_V1_STR}/webhooks", tags=["webhooks"])
