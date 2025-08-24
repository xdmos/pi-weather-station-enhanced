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

### Recent Simplifications (August 2025)
**Screensaver Settings Removed**: All screensaver configuration options removed from Settings menu. Fixed parameters:
- **Always enabled** - cannot be disabled
- **Timeout**: Fixed at 60 minutes (1 hour)
- **Duration**: Fixed at 2 minutes
- **Type**: Fixed to "images" (landscape photos with Ken Burns effect)
- **Source**: Lorem Picsum API for high-quality random images

**Units Settings Removed**: All unit toggle buttons removed from Settings menu. Fixed units:
- **Temperature**: Celsius (°C)
- **Wind Speed**: m/s (meters per second)  
- **Precipitation**: mm (millimeters)
- **Time Format**: 24-hour format

**Settings Menu Improvements**:
- **Larger title**: "SETTINGS" increased from 12px to 24px font
- **Touch-friendly close button**: X button enlarged to 32px with 48x48px touch area
- **Reorganized layout**: API keys section moved to top, SAVE button moved to bottom
- **Compact window**: Width reduced to 380px for optimal space utilization
- **Theme-aware styling**: Solid backgrounds and button colors adapt to light/dark modes
  - Light mode: Light gray background (#e8e8e8) with bright buttons
  - Dark mode: Dark gray background (#2c2c2c) with traditional dark buttons
- **Non-transparent design**: Removed blur effects and transparency for cleaner appearance
- **Mouse Control Removed**: HIDE MOUSE option removed from settings menu (moved to top control buttons)

**Interface Optimizations**:
- **Screensaver Control**: Converted countdown timer to interactive toggle button
  - Click to enable/disable screensaver functionality
  - Shows countdown time when enabled, "OFF" when disabled
  - Compact 75px width with hover/click animations
  - Maintains fixed parameters: 60min timeout, 2min duration, landscape images
- **Bottom Panel Layout**: Optimized spacing for compact screensaver button
  - SystemInfo panels moved left by 20px (135px → 115px position)
  - Eliminates gaps between bottom status panels
- **Weather Display Enhancement**: Bold values in weather detail tiles
  - Precipitation, Clouds, Wind, and Humidity values now use bold font-weight
  - Improved readability and visual hierarchy in weather statistics
- **CPU Temperature Monitoring**: Color-coded temperature display for system health
  - White color for normal temperatures (≤ 60°C)
  - Yellow color for warning temperatures (60-70°C)
  - Red color for danger temperatures (> 70°C)
  - Updates every 5 seconds with real-time system data
- **Radar Animation Removal**: Simplified weather map functionality
  - Removed play/stop animation controls for radar overlay
  - Map displays current precipitation data only (no historical animation)
  - Eliminates complex timestamp cycling and improves performance

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

# Quick restart (faster than killing processes)
npm restart

# Fast development workflow
cd client && NODE_OPTIONS=--openssl-legacy-provider npm run prod
pkill chromium && sleep 2 && DISPLAY=:0 chromium-browser --start-fullscreen --kiosk http://localhost:8080 &

# Disable auto-restart services during development
sudo systemctl stop pi-weather-station.service pi-weather-kiosk.service
sudo systemctl disable pi-weather-station.service pi-weather-kiosk.service
```

### Weather API Migration
The codebase was recently migrated from Tomorrow.io (paid, limited) to Open-Meteo (free, unlimited). Weather data parsing follows Open-Meteo's structure:
- **Current**: `data.current.temperature_2m`, `data.current.weather_code`, etc.
- **Hourly**: `data.hourly.time[]`, `data.hourly.temperature_2m[]`, etc.
- **Daily**: `data.daily.time[]`, `data.daily.temperature_2m_max[]`, etc.

### Settings and Configuration
Settings are stored securely in `~/.config/weather-station/settings.json` with API keys. The application automatically detects this secure location. Required keys:
- `mapApiKey`: Mapbox token for base map tiles (required)
- `reverseGeoApiKey`: LocationIQ token (optional, for location names)
- `startingLat/startingLon`: Default location coordinates

**Security Note**: After security audits, API keys are moved to `~/.config/weather-station/settings.json` for better protection. The local `settings.json` file is now a symlink to this secure location to maintain backward compatibility.

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
Weather radar integration uses RainViewer's tile API with timestamp-based URLs. Map displays current precipitation radar data only. Map click events update location and trigger weather data refresh.

**Map Display Optimizations:**
- **Clean Interface**: All map attribution and watermarks hidden for professional appearance
- **Full Screen Usage**: Removed Leaflet/Mapbox attribution controls to maximize map area
- **Touch-Optimized**: Map interactions optimized for touchscreen navigation
- **Current Data Only**: Radar animation functionality removed - map shows only current/latest radar data
- **Static Radar Display**: No animation cycling through historical timestamps

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
- **Improved Panel Layout**: Increased spacing between sunrise/sunset and location sections
- **Optimized Grid Structure**: Removed obsolete controls area to maximize content space
- **Mouse Toggle Control**: Third button now controls mouse cursor visibility
  - Shows "ON" when mouse cursor is visible
  - Shows "OFF" when mouse cursor is hidden
  - Extra bold font (weight: 900) at 12px size for clear visibility
  - No color change on toggle - maintains consistent appearance

## Display Optimizations

### 5-inch Display Support
The interface has been optimized for small touchscreens (5-7 inch):

#### Settings Layout
- **Streamlined Design**: Removed unit toggles and screensaver options (now fixed settings)
- **Simplified Sections**:
  1. Location settings (custom starting coordinates)
  2. API Keys (Mapbox required, LocationIQ optional)  
  3. Save button
- **Clean Interface**: Focused only on essential configuration options
- **Responsive Elements**: Buttons and inputs sized for touch interaction
- **Mouse Control Moved**: Hide/show mouse functionality moved to top control buttons

#### Containerized Layout System
The interface uses a modular container-based layout for optimal organization and space utilization:

**Layout Structure:**
1. **Header Container**: Date, time, sunrise/sunset times (transparent background)
2. **Location Container**: User location display (minimal padding, positioned directly under header)
3. **Current Weather Container**: Weather icon with current/apparent temperature in horizontal layout
4. **Weather Details Container**: Four weather metrics (precipitation, clouds, wind, humidity) in horizontal grid
5. **Temperature Chart Container**: 24-hour temperature and precipitation visualization
6. **Daily Forecast Container**: 4-day forecast with horizontal temperature display (max/min in same line)

**Container Features:**
- **Subtle Visual Separation**: Each container has rounded borders and semi-transparent backgrounds
- **Ultra-Compact Spacing**: 2px gaps between containers on 800x600 displays for maximum content density
- **Responsive Padding**: 4px internal padding on small screens, larger on desktop displays
- **No Redundant Labels**: Removed "4 Day Forecast" title to save vertical space
- **Zero-Margin Location**: Location positioned directly under sunrise/sunset with no gap
- **Theme-Consistent Design**: Weather icons and statistics adapt to dark/light mode themes
- **Transparent Backgrounds**: Weather detail cards use transparent backgrounds with gray borders
- **Future-Focused Forecast**: Daily forecast shows next 4 days excluding current day

#### Info Panel Layout Improvements
- **Eliminated Control Area**: Removed obsolete button controls section from grid layout
- **Enhanced Spacing**: Optimized container spacing for different screen sizes
- **Flex-Based Layout**: Modern flexbox layout system replacing grid for better responsive behavior
- **Better Content Distribution**: Maximized available space for weather information display
- **Wider Side Panel**: Increased from 250px to 300px for better content accommodation

#### Style Adjustments for Small Screens
- Reduced font sizes (10-11px for labels, 9-10px for sublabels)
- Smaller buttons (26x26px base, 45px width for unit toggles)
- Ultra-compact margins and padding (2-4px on 800x600 displays)
- Dark dropdown options for better contrast
- Media queries for screens under 480px height and 800px width
- Optimized border-radius (3px on small screens, 4-6px on larger displays)

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
- `--no-sandbox`: Required for systemd service execution (optional for manual launch)
- `--disable-infobars`: Removes info bars (optional for manual launch)
- `--disable-restore-session-state`: Prevents session restore dialogs
- `--disable-session-crashed-bubble`: Prevents crash recovery dialogs

### Development vs Production
**Development Mode**: For testing and development, disable systemd services to prevent automatic restarts:
```bash
sudo systemctl stop pi-weather-station.service pi-weather-kiosk.service
sudo systemctl disable pi-weather-station.service pi-weather-kiosk.service
```

**Production Mode**: Re-enable systemd services for automatic startup on boot:
```bash
sudo systemctl enable pi-weather-station.service pi-weather-kiosk.service
sudo systemctl start pi-weather-station.service pi-weather-kiosk.service
```

**Manual Chromium Launch** (simplified for development):
```bash
DISPLAY=:0 chromium-browser --start-fullscreen --kiosk http://localhost:8080 &
```

## Latest Changes (August 24, 2025)

### Service Stability Fixes
- **Server Startup Optimization**: Removed problematic `await open()` call from server startup that was causing instability in systemd environment
- **Kiosk Service Redesign**: Fixed pi-weather-kiosk.service configuration to prevent continuous restarts
  - Changed from `Type=simple` with `Restart=always` to `Type=oneshot` with `RemainAfterExit=yes`
  - Added server availability check before launching Chromium
  - Added `--new-window` flag to prevent session conflicts
  - Eliminated restart loops that were occurring every 15-20 seconds
- **Settings Security Integration**: Modified settingsCtrl.js to automatically detect and use secure settings location
  - Primary: `~/.config/weather-station/settings.json` (security audit compliant)
  - Fallback: Local `settings.json` for backward compatibility
  - Created symlink from local to secure location for seamless operation
- **API Keys Protection**: Ensured weather station continues working after security audits move API keys to secure location

### Display and Interface Updates
- **Clock Container Relocated**: Moved date, time, and sunrise/sunset display from InfoPanel sidebar to WeatherMap overlay
  - **Map Overlay Position**: Clock container now appears as transparent overlay in bottom-left corner of map
  - **Above Screensaver Counter**: Positioned 80px from bottom, 10px from left, above screensaver countdown tile
  - **Inline Styling**: Uses direct inline styles instead of CSS Modules to ensure proper font sizing
  - **Custom Font Sizes**: 
    - Date: 24px bold ("SUNDAY AUGUST 24")
    - Time: 42px bold ("19:20")
    - Sunrise/Sunset: 20px bold ("☀ 05:58  ● 20:05")
  - **Transparent Design**: No background, borders, or visual interference with map
  - **Direct Implementation**: Sunrise/sunset rendered directly with emoji icons instead of SunRiseSet component
- **InfoPanel Streamlining**: Removed Clock component import and headerContainer from sidebar panel
- **CSS Cleanup**: Eliminated conflicting CSS Module styles that were overriding inline font specifications
- **Right Panel Font Enhancements**: Significantly enlarged all text elements in sidebar for better readability
  - **Weather Icon**: Increased from 50px to 80px (60% larger)
  - **Main Temperature**: Increased from 48px to 64px (33% larger) 
  - **Temperature Details**: All related elements scaled proportionally (degrees, slash, apparent temp)
  - **Weather Statistics**: Labels increased from 11px to 13px, values from 12px to 14px (+2px each)
  - **Daily Forecast**: Day names from 12px to 14px, weather icons from 28px to 30px, temperatures from 13px to 15px (+2px each)
  - **Optimized Spacing**: Increased gaps and padding to better utilize available panel space

### Stability and Reliability Improvements
- **Systemd Service Optimization**: Both weather station and kiosk services now operate without conflicts
- **Automatic Recovery**: Services properly handle restarts and dependencies without manual intervention
- **Settings Persistence**: Configuration survives security audits and system maintenance
- **Production Ready**: Stable operation confirmed for extended periods without restarts or refreshes

## Previous Changes (August 22, 2025)
- **Top Control Button Icon Improvements**: Enhanced visual feedback for control buttons with color-coded states
  - **Mouse Cursor Toggle**: Icon changes color - black when cursor visible (ON), light gray when hidden (OFF)
  - **Location Marker Toggle**: Uses single location icon with color coding - black when marker visible (ON), light gray when hidden (OFF)
  - **Removed Crossed Icons**: Eliminated confusing crossed-out icons in favor of intuitive color changes
  - **Consistent Visual Language**: Both mouse and location toggles now use same color system for better UX
- **Code Optimization**: Removed unused import (roundLocationOff) and simplified icon logic
- **UI Clarity**: Improved button state recognition through consistent color feedback system

## Previous Changes (August 19, 2025)
- **Radar Animation Removed**: Completely removed weather radar animation functionality from WeatherMap component
- **Mouse Control Relocated**: Moved mouse cursor toggle from Settings menu to TopControlButtons (third button)
- **Button Design**: Mouse toggle shows "ON"/"OFF" text labels with bold font (weight: 900, 12px) instead of icons
- **Code Cleanup**: Removed animateWeatherMap state, toggleAnimateWeatherMap function, and related animation logic
- **Settings Simplified**: Removed Hide Mouse toggle button from Settings menu interface
- **CSS Enhancement**: Improved mouse cursor hiding with .hideMouse class affecting all child elements
- **Performance Improvement**: Eliminated complex timestamp cycling and reduced API calls
- **UI Consistency**: All control buttons maintain consistent styling without color changes on toggle