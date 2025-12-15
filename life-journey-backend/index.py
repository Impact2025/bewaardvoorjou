"""
Vercel serverless entry point for FastAPI app.
"""
import sys
from pathlib import Path

# Ensure app directory is in path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from mangum import Mangum
from app.main import app

# Vercel serverless handler
handler = Mangum(app, lifespan="off")
