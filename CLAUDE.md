# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pi Weather Station is a React-based weather application designed for Raspberry Pi 7" touchscreens. It displays current weather, hourly/daily forecasts, interactive maps with weather radar, and automatically switches between light/dark modes based on sunrise/sunset times.

## Architecture

### Client-Server Structure
- **Server**: Express.js backend in `/server/` serving static files and API endpoints for settings/geolocation
- **Client**: React SPA in `/client/src/` with Webpack build system

### Core Components Architecture
- **AppContext**: Central state management using React Context - manages all weather data, settings, geolocation, dark mode, screensaver state, and API keys
- **WeatherMap**: Leaflet-based interactive map with RainViewer radar overlay and Mapbox base tiles
- **WeatherInfo**: Main weather display container that orchestrates CurrentWeather and chart components
- **WeatherCharts**: Chart.js-based hourly (24h) and daily (5-day) forecast visualizations
- **Screensaver**: Pixel burn-in prevention component with three display modes (images, videos, animations)
- **ScreensaverCountdown**: Timer component showing countdown to screensaver activation
- **SystemInfo**: System monitoring component displaying CPU temperature and fan speed
- **TopControlButtons**: Touch-optimized control buttons relocated to top-left area for easy access

### API Integration
- **Weather Data**: Open-Meteo API (free, no key required) for current/hourly/daily weather
- **Weather Radar**: RainViewer API (free, no key required) for precipitation radar overlays
- **Maps**: Mapbox API (requires key) for base map tiles
- **Reverse Geocoding**: LocationIQ API (optional) for location names
- **Sunrise/Sunset**: Sunrise-Sunset.org API (free, no key required)
- **Screensaver Images**: Lorem Picsum API (free, no key required) for high-quality random images
- **System Monitoring**: `/system-info` endpoint provides CPU temperature and fan speed data

### State Management Pattern
All application state flows through AppContext with specific update functions for each data type. Weather data updates automatically on intervals (current: 3min, hourly: 1hr, daily: 24hr). Screensaver state includes activity tracking, timeout management, and countdown timers.

## Common Commands

### Development
```bash
# Install dependencies (run from root)
npm install

# Start development server (serves client + API)
npm start

# Build client for production (requires legacy OpenSSL)
cd client && NODE_OPTIONS=--openssl-legacy-provider npm run prod

# Development build with watch mode
cd client && npm run dev
```

### Weather API Migration
The codebase was recently migrated from Tomorrow.io (paid, limited) to Open-Meteo (free, unlimited). Weather data parsing follows Open-Meteo's structure:
- **Current**: `data.current.temperature_2m`, `data.current.weather_code`, etc.
- **Hourly**: `data.hourly.time[]`, `data.hourly.temperature_2m[]`, etc.
- **Daily**: `data.daily.time[]`, `data.daily.temperature_2m_max[]`, etc.

### Settings and Configuration
Settings are stored in `/settings.json` with API keys. Required keys:
- `mapApiKey`: Mapbox token for base map tiles (required)
- `reverseGeoApiKey`: LocationIQ token (optional, for location names)
- `startingLat/startingLon`: Default location coordinates

Note: Weather API key is no longer needed as Open-Meteo is free and doesn't require authentication.

### Dark Mode Implementation
Touch-optimized dark/light mode system with three-state cycling:
- **Light mode**: Bright interface suitable for daytime use
- **Dark mode**: Dark interface for low-light conditions
- **Auto mode**: Automatic switching based on sunrise/sunset times (indicated by red border)
- Single button cycles through: Light → Dark → Auto → Light
- Updates every minute when in auto mode
- Optimized for touch interfaces without need for right-click

### Build Notes
- Requires `NODE_OPTIONS=--openssl-legacy-provider` due to legacy webpack/crypto dependencies
- CSS Modules enabled with camelCase conversion (`no-map` → `noMap`)
- Webpack configured for production builds with code splitting

### Map Integration
Weather radar integration uses RainViewer's tile API with timestamp-based URLs. Radar animation cycles through available timestamps when enabled. Map click events update location and trigger weather data refresh.

## Screensaver Feature

### Purpose
Prevents OLED/LCD pixel burn-in on displays by activating after a period of inactivity.

### Recent Fixes
- Fixed screensaver repeating multiple times after duration expires (removed duplicate timer logic)
- Fixed screensaver timer reset loop caused by useEffect dependency array
- Removed deactivateScreensaver from useEffect dependencies to prevent timer restarts
- Restored lastActivityTime reset in deactivateScreensaver for proper cycle management
- Screensaver now properly deactivates after set duration without re-triggering or looping

### Display Modes
1. **Landscape Images**: Rotating high-quality random photos from Lorem Picsum with Ken Burns effect
2. **Nature Videos**: Looping scenic videos (streamed from internet)
3. **Abstract Animation**: CSS-based wave animations with gradient background (works offline)

### Configuration
Located in Settings menu under "SCREENSAVER" section:
- **Enable/Disable**: Toggle screensaver on/off
- **Timeout Options**: 30 minutes, 1 hour, 2 hours, 3 hours
- **Duration Options**: 1, 3, 5, or 10 minutes
- **Content Type**: Choose between images, videos, or animations

### Activity Detection
- Monitors: mouse movement, clicks, touches, keyboard input, and scroll events
- Automatically deactivates on any user interaction
- Returns to weather display immediately when interrupted
- 24-hour clock display shown in bottom-right corner during screensaver

### Implementation Details
- Images rotate every 20 seconds with smooth transitions
- Ken Burns effect provides gentle zoom and movement on images
- Automatic error handling - skips to next image if loading fails
- Loading indicators during image transitions
- All settings persist in localStorage
- No additional API keys required (uses free Lorem Picsum API)
- Requires internet connection for images/videos, animations work offline

### Timer Components
- **Main Application Timer**: Bottom-left corner shows countdown to screensaver activation
- **Screensaver Timer**: Bottom-left corner shows remaining screensaver duration
- **Clock Display**: Bottom-right corner shows current time in 24-hour format during screensaver
- Updates every second for accurate time tracking
- Automatically hides when screensaver is disabled or not applicable

### System Monitoring Display
- **CPU Temperature**: Shows real-time CPU temperature in Celsius
- **Fan Speed**: Displays fan speed as percentage or RPM (depending on available sensors)
- **Bottom Bar Layout**: Screensaver countdown (left), CPU temp (center-left), Fan speed (center-right)
- Updates every 5 seconds for current system status
- Compact design optimized for small displays

### Touch Interface Optimization
- **Relocated Control Buttons**: Moved from bottom-right to top-left for better accessibility
- **Touch-Friendly Sizing**: 60px wide buttons with proper spacing for finger navigation
- **Visual Feedback**: Hover and active states for all interactive elements
- **Dual Theme Support**: Automatic styling adaptation for dark/light modes
- **Icon Scaling**: 16px icons sized appropriately for button containers
- **Auto Mode Indicator**: Red border clearly identifies automatic theme mode

## Display Optimizations

### 5-inch Display Support
The interface has been optimized for small touchscreens (5-7 inch):

#### Settings Layout
- **Compact Design**: All unit toggles (F/C, mph/m/s, in/mm, 12h/24h) in single row
- **Reorganized Sections**: 
  1. Units (top, single row)
  2. Screensaver options
  3. Hide Mouse + Save button
  4. API Keys (bottom, scrollable)
- **Scrollable Interface**: Vertical scrolling with styled scrollbar for overflow content
- **Responsive Elements**: Buttons and inputs sized for touch interaction

#### Style Adjustments for Small Screens
- Reduced font sizes (10-11px for labels, 9-10px for sublabels)
- Smaller buttons (26x26px base, 45px width for unit toggles)
- Compact margins and padding throughout
- Dark dropdown options for better contrast
- Media queries for screens under 480px height and 800px width

## Autostart Configuration

The project includes systemd services for automatic startup on Raspberry Pi boot.

### Service Files
- **`pi-weather-station.service`**: Starts the Node.js backend server on port 8080
- **`pi-weather-kiosk.service`**: Launches Chromium in fullscreen kiosk mode pointing to localhost:8080
- **`start-weather-station.sh`**: Manual startup script with network checks

### Installation Commands
```bash
# Copy service files to systemd
sudo cp pi-weather-station.service /etc/systemd/system/
sudo cp pi-weather-kiosk.service /etc/systemd/system/

# Reload systemd and enable services
sudo systemctl daemon-reload
sudo systemctl enable pi-weather-station.service
sudo systemctl enable pi-weather-kiosk.service

# Start services immediately (optional)
sudo systemctl start pi-weather-station.service
sudo systemctl start pi-weather-kiosk.service
```

### Service Management
```bash
# Check service status
sudo systemctl status pi-weather-station.service
sudo systemctl status pi-weather-kiosk.service

# View service logs
sudo journalctl -u pi-weather-station.service -f
sudo journalctl -u pi-weather-kiosk.service -f

# Restart services
sudo systemctl restart pi-weather-station.service
sudo systemctl restart pi-weather-kiosk.service

# Disable autostart
sudo systemctl disable pi-weather-station.service
sudo systemctl disable pi-weather-kiosk.service
```

### Autostart Behavior
On system boot, the Pi Weather Station will:
1. Start the backend server automatically
2. Wait for network connectivity
3. Launch Chromium in fullscreen kiosk mode
4. Display the weather station interface
5. Restart automatically if services crash

### Chromium Kiosk Options
The kiosk service uses these Chromium flags:
- `--start-fullscreen`: Starts in fullscreen mode
- `--kiosk`: Enables kiosk mode (no address bar, etc.)
- `--no-sandbox`: Required for systemd service execution
- `--disable-infobars`: Removes info bars
- `--disable-restore-session-state`: Prevents session restore dialogs
- `--disable-session-crashed-bubble`: Prevents crash recovery dialogs