#!/usr/bin/env python3

import os
import sys
import time
import traceback

def main():
    print("=== Starting Synthetic Data Generator ===")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print(f"PORT environment variable: {os.environ.get('PORT', 'NOT SET')}")
    
    try:
        print("Step 1: Importing modules...")
        from persona_generator import PersonaGenerator
        print("✓ PersonaGenerator imported successfully")
        
        from database_factory import get_database, DatabaseFactory
        print("✓ Database factory imported successfully")
        
        from api import app
        print("✓ Flask app imported successfully")
        
        print("Step 2: Testing basic functionality...")
        generator = PersonaGenerator()
        print("✓ PersonaGenerator instance created")
        
        db_info = DatabaseFactory.get_database_info()
        print(f"✓ Database type: {db_info['selected_type']}")
        
        db = get_database()
        print(f"✓ Database instance created ({type(db).__name__})")
        
        health = db.health_check()
        print(f"✓ Database health check: {health}")
        
        print("Step 3: Starting Flask server...")
        port = int(os.environ.get('PORT', 8080))
        print(f"Starting server on 0.0.0.0:{port}")
        
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print("Full traceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()