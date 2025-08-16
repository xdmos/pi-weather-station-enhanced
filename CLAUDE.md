# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pi Weather Station is a React-based weather application designed for Raspberry Pi 7" touchscreens. It displays current weather, hourly/daily forecasts, interactive maps with weather radar, and automatically switches between light/dark modes based on sunrise/sunset times.

## Architecture

### Client-Server Structure
- **Server**: Express.js backend in `/server/` serving static files and API endpoints for settings/geolocation
- **Client**: React SPA in `/client/src/` with Webpack build system

### Core Components Architecture
- **AppContext**: Central state management using React Context - manages all weather data, settings, geolocation, dark mode, and API keys
- **WeatherMap**: Leaflet-based interactive map with RainViewer radar overlay and Mapbox base tiles
- **WeatherInfo**: Main weather display container that orchestrates CurrentWeather and chart components
- **WeatherCharts**: Chart.js-based hourly (24h) and daily (5-day) forecast visualizations

### API Integration
- **Weather Data**: Open-Meteo API (free, no key required) for current/hourly/daily weather
- **Weather Radar**: RainViewer API (free, no key required) for precipitation radar overlays
- **Maps**: Mapbox API (requires key) for base map tiles
- **Reverse Geocoding**: LocationIQ API (optional) for location names
- **Sunrise/Sunset**: Sunrise-Sunset.org API (free, no key required)

### State Management Pattern
All application state flows through AppContext with specific update functions for each data type. Weather data updates automatically on intervals (current: 10min, hourly: 1hr, daily: 24hr).

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
- `mapApiKey`: Mapbox token for base map tiles
- `reverseGeoApiKey`: LocationIQ token (optional)
- `startingLat/startingLon`: Default location coordinates

### Dark Mode Implementation
Automatic dark/light mode switches based on sunrise/sunset times with manual override:
- **Auto mode** (default): Uses sunrise/sunset API data to determine day/night
- **Manual mode**: User-controlled via contrast button (right-click to toggle auto/manual)
- Updates every minute when in auto mode

### Build Notes
- Requires `NODE_OPTIONS=--openssl-legacy-provider` due to legacy webpack/crypto dependencies
- CSS Modules enabled with camelCase conversion (`no-map` → `noMap`)
- Webpack configured for production builds with code splitting

### Map Integration
Weather radar integration uses RainViewer's tile API with timestamp-based URLs. Radar animation cycles through available timestamps when enabled. Map click events update location and trigger weather data refresh.