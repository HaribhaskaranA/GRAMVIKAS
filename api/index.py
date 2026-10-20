"""
GRAMVIKAS AI - Vercel Serverless Function Entry Point.
Exposes FastAPI 'app' for serverless invocations under @vercel/python.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

handler = app
