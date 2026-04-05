"""Vercel serverless handler for ONE PERCENT EDGE application."""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.api import app

# This is the handler that Vercel will call
async def handler(request):
    """ASGI handler for Vercel."""
    return app(request)

# Export for Vercel
app = app
