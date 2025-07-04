#!/usr/bin/env python3
"""
Simple script to run the Flask application
"""

from app import app

if __name__ == '__main__':
    print("Starting AI-Powered Excuse Generator System...")
    print("Open your browser and go to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)