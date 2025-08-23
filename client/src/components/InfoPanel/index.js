import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "~/AppContext";
import Clock from "~/components/Clock";
import WeatherInfo from "~/components/WeatherInfo";
import styles from "./styles.css";

/**
 * Info Panel with organized containers
 *
 * @returns {JSX.Element} Info Panel
 */
const InfoPanel = () => {
  const { darkMode, currentWeatherData } = useContext(AppContext);
  const [bgIndex, setBgIndex] = useState(0);

  // Weather background color sets
  const weatherBackgrounds = {
    clear: {
      light: [
        ['#87CEEB', '#E0F6FF', '#87CEEB'],           // Base blue sky
        ['#FFD700', '#87CEEB', '#E0F6FF'],           // Sunny yellow
        ['#FFA500', '#FFD700', '#87CEEB']            // Orange sunset
      ],
      dark: [
        ['#1a1a2e', '#16213e', '#0f3460'],          // Night blue
        ['#2F2F4F', '#1a1a2e', '#16213e'],          // Deeper night
        ['#0f3460', '#1a1a2e', '#2F2F4F']           // Midnight
      ]
    },
    cloudy: {
      light: [
        ['#87CEEB', '#B0C4DE', '#E6E6FA'],          // Light cloudy
        ['#778899', '#9A9ACD', '#D3D3D3'],          // Medium clouds
        ['#696969', '#B0C4DE', '#F0F8FF']           // Heavy clouds
      ],
      dark: [
        ['#2F4F4F', '#34495e', '#2c3e50'],          // Dark cloudy
        ['#1C1C1C', '#2A2A2A', '#1A1A1A'],          // Very dark
        ['#34495e', '#2c3e50', '#2F4F4F']           // Storm approaching
      ]
    },
    rain: {
      light: [
        ['#696969', '#A9A9A9', '#D3D3D3'],          // Light rain
        ['#4682B4', '#5F9EA0', '#B0C4DE'],          // Medium rain
        ['#2F4F4F', '#696969', '#A9A9A9']           // Heavy rain
      ],
      dark: [
        ['#2C3E50', '#34495E', '#4A5568'],          // Dark rain
        ['#1A1A1A', '#2C3E50', '#34495E'],          // Night rain
        ['#0D1117', '#1A1A1A', '#2C3E50']           // Heavy night rain
      ]
    },
    snow: {
      light: [
        ['#F0F8FF', '#E6E6FA', '#F5F5F5'],          // Light snow
        ['#E0E0E0', '#F0F8FF', '#FFFFFF'],          // Medium snow
        ['#D3D3D3', '#E6E6FA', '#F8F8FF']           // Heavy snow
      ],
      dark: [
        ['#2F4F4F', '#363636', '#4A4A4A'],          // Dark snow
        ['#1C1C1C', '#2F4F4F', '#363636'],          // Night snow
        ['#0F0F0F', '#1C1C1C', '#2F4F4F']           // Blizzard
      ]
    },
    storm: {
      light: [
        ['#2F2F2F', '#4A4A4A', '#696969'],          // Storm clouds
        ['#1C1C1C', '#2F2F2F', '#4A4A4A'],          // Dark storm
        ['#000000', '#1C1C1C', '#2F2F2F']           // Severe storm
      ],
      dark: [
        ['#1C1C1C', '#2A2A2A', '#3A3A3A'],          // Dark storm
        ['#0D0D0D', '#1C1C1C', '#2A2A2A'],          // Night storm
        ['#000000', '#0D0D0D', '#1C1C1C']           // Severe night storm
      ]
    },
    fog: {
      light: [
        ['#D3D3D3', '#E5E5E5', '#F0F0F0'],          // Light fog
        ['#C0C0C0', '#D3D3D3', '#E5E5E5'],          // Medium fog
        ['#A9A9A9', '#C0C0C0', '#D3D3D3']           // Dense fog
      ],
      dark: [
        ['#3A3A3A', '#4A4A4A', '#5A5A5A'],          // Dark fog
        ['#2A2A2A', '#3A3A3A', '#4A4A4A'],          // Night fog
        ['#1A1A1A', '#2A2A2A', '#3A3A3A']           // Dense night fog
      ]
    }
  };

  // Get weather type for background animation
  const getWeatherType = (code) => {
    if (!code && code !== 0) return "clear";
    
    if (code === 0) return "clear";                     // Clear sky
    if (code >= 1 && code <= 3) return "cloudy";        // Partly cloudy to overcast
    if (code === 45 || code === 48) return "fog";       // Fog
    if (code >= 51 && code <= 67) return "rain";        // Drizzle and rain
    if (code >= 71 && code <= 86) return "snow";        // Snow
    if (code >= 95 && code <= 99) return "storm";       // Thunderstorm
    
    return "clear"; // Default
  };

  const weatherCode = currentWeatherData?.current?.weather_code;
  const weatherType = getWeatherType(weatherCode);
  const theme = darkMode ? 'dark' : 'light';
  
  // Animate background colors
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % 3);
    }, 8000); // Change every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get current colors for animation
  const currentColors = weatherBackgrounds[weatherType]?.[theme]?.[bgIndex] || weatherBackgrounds.clear[theme][0];
  
  // Create gradient background
  const backgroundStyle = {
    background: `linear-gradient(180deg, ${currentColors[0]} 0%, ${currentColors[1]} 50%, ${currentColors[2]} 100%)`,
    transition: 'background 3s ease-in-out'
  };

  return (
    <div 
      className={`${darkMode ? styles.dark : styles.light} ${styles.panel}`}
      style={backgroundStyle}
    >
      <div className={styles.container}>
        {/* Container 1: Date, time, sunrise/sunset */}
        <div className={styles.headerContainer}>
          <Clock />
        </div>
        
        {/* Container 2-5: Weather components */}
        <div className={styles.weatherContainer}>
          <WeatherInfo />
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
