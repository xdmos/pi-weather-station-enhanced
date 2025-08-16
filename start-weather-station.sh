#!/bin/bash

# Pi Weather Station Startup Script
# This script ensures the weather station starts properly on boot

# Wait for network
while ! ping -c 1 google.com &> /dev/null; do
    echo "Waiting for network connection..."
    sleep 5
done

# Start the weather station service
sudo systemctl start pi-weather-station.service

# Wait for the service to be ready
sleep 10

# Check if localhost:8080 is responding
while ! curl -s http://localhost:8080 > /dev/null; do
    echo "Waiting for weather station to start..."
    sleep 5
done

echo "Pi Weather Station is ready!"

# Start chromium in kiosk mode
export DISPLAY=:0
chromium-browser --start-fullscreen --kiosk --no-sandbox --disable-infobars --disable-restore-session-state --disable-session-crashed-bubble --disable-features=TranslateUI --disable-ipc-flooding-protection http://localhost:8080/