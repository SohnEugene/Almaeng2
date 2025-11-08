from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Import routers
from app.routes import kiosk, payment, product

# Import services
from app.services.firebase import firebase_service

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Kiosk Management API",
    description="FastAPI backend for managing kiosks, products, and transactions with Firebase integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    print("Starting Kiosk Management API...")

    try:
        # Initialize Firebase
        firebase_service.initialize()
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Warning: Firebase initialization failed: {e}")
        print("The API will run but database operations may not work correctly")

    print("API is ready to accept requests")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    print("Shutting down Kiosk Management API...")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint returning API information"""
    return {
        "message": "Welcome to Kiosk Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "firebase": "connected" if firebase_service.db else "disconnected"
    }


# Register routers
app.include_router(kiosk.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(product.router, prefix="/api")


# Run the application
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
