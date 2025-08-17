import React, { useContext } from "react";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";
import { convertTemp } from "~/services/conversions";
import { InlineIcon } from "@iconify/react";
import daySunny from "@iconify/icons-wi/day-sunny";
import dayCloudy from "@iconify/icons-wi/day-cloudy";
import dayRain from "@iconify/icons-wi/day-rain";
import snowIcon from "@iconify/icons-ion/snow";
import thunderstormIcon from "@iconify/icons-wi/thunderstorm";
import fogIcon from "@iconify/icons-wi/fog";
import cloudyIcon from "@iconify/icons-wi/cloudy";

/**
 * Daily forecast list component
 * 
 * @returns {JSX.Element} Daily forecast list
 */
const DailyForecastList = () => {
  const { dailyWeatherData, tempUnit, darkMode } = useContext(AppContext);

  if (!dailyWeatherData?.daily) {
    return null;
  }

  const { 
    time, 
    temperature_2m_max: tempMax, 
    temperature_2m_min: tempMin, 
    weather_code: weatherCode 
  } = dailyWeatherData.daily;

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getWeatherIcon = (code) => {
    switch (code) {
      case 0:
      case 1:
        return daySunny;
      case 2:
        return dayCloudy;
      case 3:
        return cloudyIcon;
      case 45:
      case 48:
        return fogIcon;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return dayRain;
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return snowIcon;
      case 95:
      case 96:
      case 99:
        return thunderstormIcon;
      default:
        return daySunny;
    }
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : styles.light}`}>
      <div className={styles.forecastList}>
        {time?.slice(0, 4).map((day, index) => (
          <div key={index} className={styles.dayItem}>
            <div className={styles.dayName}>{getDayName(day)}</div>
            <div className={styles.weatherIcon}>
              <InlineIcon icon={getWeatherIcon(weatherCode[index])} />
            </div>
            <div className={styles.temperatures}>
              <span className={styles.tempMax}>
                {convertTemp(tempMax[index], tempUnit)}°
              </span>
              <span className={styles.tempMin}>
                {convertTemp(tempMin[index], tempUnit)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecastList;