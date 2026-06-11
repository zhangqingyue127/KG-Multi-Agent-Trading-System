#!/bin/bash

# Script to start both React and Flask servers

echo "Starting Huluntunzao Application..."
echo ""

# Start Flask API server in background
echo "Starting Flask API server on port 5000..."
python api_server.py &
FLASK_PID=$!

# Wait for Flask to start
sleep 3

# Start React development server in foreground
echo "Starting React development server on port 3000..."
npm start

# On exit, kill Flask server
trap "kill $FLASK_PID" EXIT

echo ""
echo "Both servers are running..."
echo "React: http://localhost:3000"
echo "Flask API: http://localhost:5000"
echo ""
