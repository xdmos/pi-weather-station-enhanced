import React, { useContext } from "react";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";
import {
  convertTemp,
  convertSpeed,
} from "~/services/conversions";

import { InlineIcon } from "@iconify/react";
import degreesIcon from "@iconify/icons-wi/degrees";
import nightClear from "@iconify/icons-wi/night-clear";
import daySunny from "@iconify/icons-wi/day-sunny";
import dayCloudy from "@iconify/icons-wi/day-cloudy";
import nightAltCloudy from "@iconify/icons-wi/night-alt-cloudy";
import dayRain from "@iconify/icons-wi/day-rain";
import nightRain from "@iconify/icons-wi/night-rain";
import humidityAlt from "@iconify/icons-carbon/humidity-alt";
import cloudIcon from "@iconify/icons-wi/cloud";
import strongWind from "@iconify/icons-wi/strong-wind";
import snowIcon from "@iconify/icons-ion/snow";
import rainIcon from "@iconify/icons-wi/rain";
import rainMix from "@iconify/icons-wi/rain-mix";
import thunderstormIcon from "@iconify/icons-wi/thunderstorm";
import fogIcon from "@iconify/icons-wi/fog";
import cloudyIcon from "@iconify/icons-wi/cloudy";
import daySunnyOvercast from "@iconify/icons-wi/day-sunny-overcast";

/**
 * Current weather conditions
 * Uses Open-Meteo API for weather data
 *
 * @returns {JSX.Element} Current weather conditions component
 */
const CurrentWeather = () => {
  const { currentWeatherData, tempUnit, speedUnit, sunriseTime, sunsetTime } = useContext(
    AppContext
  );
  const weatherData = currentWeatherData?.current;
  if (weatherData) {
    const {
      cloud_cover: cloudCover,
      relative_humidity_2m: humidity,
      precipitation: precipitationIntensity,
      temperature_2m: temperature,
      weather_code: weatherCode,
      wind_speed_10m: windSpeed,
    } = weatherData;
    const daylight = sunriseTime && sunsetTime ? isDaylight(new Date(sunriseTime), new Date(sunsetTime)) : true;
    const { icon: weatherIcon, desc: weatherDesc } =
      parseWeatherCode(weatherCode, daylight) || {};

    return (
      <div className={styles.container}>
        <div className={styles.currentTemp}>
          {convertTemp(temperature, tempUnit)}
          <InlineIcon icon={degreesIcon} />
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.weatherIcon}>
            {weatherIcon ? <InlineIcon icon={weatherIcon} /> : null}
          </div>
        </div>
        <div className={styles.stats}>
          <div>
            <div className={styles.statItem}>
              <div>
                <InlineIcon
                  icon={precipitationIntensity > 0 ? rainIcon : cloudIcon}
                />
              </div>
              <div>{precipitationIntensity?.toFixed(1) || 0} mm</div>
            </div>
            <div className={styles.statItem}>
              <div>
                <InlineIcon icon={cloudIcon} />
              </div>
              <div>{parseInt(cloudCover)}%</div>
            </div>
            <div className={styles.statItem}>
              <div>
                <InlineIcon icon={strongWind} />
              </div>
              <div className={styles.textUnit}>
                <div>{convertSpeed(windSpeed, speedUnit)}</div>
                <div className={styles.statUnit}>
                  {speedUnit === "mph" ? " mph" : " m/s"}
                </div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div>
                <InlineIcon icon={humidityAlt} />
              </div>
              <div>{parseInt(humidity)}%</div>
            </div>
          </div>
        </div>
        <div className={styles.description}>{weatherDesc || ""}</div>
      </div>
    );
  } else {
    return <div></div>;
  }
};

/**
 * Parse WMO weather code used by Open-Meteo
 * https://open-meteo.com/en/docs
 *
 * @param {Number} code
 * @param {Boolean} [isDay] if it is currently day
 * @returns {Object} weather description and icon
 */
const parseWeatherCode = (code, isDay) => {
  switch (code) {
    case 0:
      return { desc: "Clear sky", icon: isDay ? daySunny : nightClear };
    case 1:
      return { desc: "Mainly clear", icon: isDay ? dayCloudy : nightAltCloudy };
    case 2:
      return { desc: "Partly cloudy", icon: isDay ? daySunnyOvercast : nightAltCloudy };
    case 3:
      return { desc: "Overcast", icon: cloudyIcon };
    case 45:
    case 48:
      return { desc: "Fog", icon: fogIcon };
    case 51:
    case 53:
    case 55:
      return { desc: "Drizzle", icon: rainMix };
    case 56:
    case 57:
      return { desc: "Freezing drizzle", icon: rainMix };
    case 61:
      return { desc: "Light rain", icon: isDay ? dayRain : nightRain };
    case 63:
      return { desc: "Moderate rain", icon: isDay ? dayRain : nightRain };
    case 65:
      return { desc: "Heavy rain", icon: isDay ? dayRain : nightRain };
    case 66:
    case 67:
      return { desc: "Freezing rain", icon: isDay ? dayRain : nightRain };
    case 71:
      return { desc: "Light snow", icon: snowIcon };
    case 73:
      return { desc: "Moderate snow", icon: snowIcon };
    case 75:
      return { desc: "Heavy snow", icon: snowIcon };
    case 77:
      return { desc: "Snow grains", icon: snowIcon };
    case 80:
    case 81:
    case 82:
      return { desc: "Rain showers", icon: isDay ? dayRain : nightRain };
    case 85:
    case 86:
      return { desc: "Snow showers", icon: snowIcon };
    case 95:
      return { desc: "Thunderstorm", icon: thunderstormIcon };
    case 96:
    case 99:
      return { desc: "Thunderstorm with hail", icon: thunderstormIcon };
    default:
      return { desc: "Unknown", icon: isDay ? daySunny : nightClear };
  }
};

/**
 * Determine if it is currently daylight
 *
 * @param {Date} sunrise
 * @param {Date} sunset
 * @returns {Boolean} if current time is during daylight
 */
function isDaylight(sunrise, sunset) {
  const sunriseTime = new Date(sunrise).getTime();
  const sunsetTime = new Date(sunset).getTime();
  const now = new Date().getTime();
  return !!(now > sunriseTime && now < sunsetTime);
}

export default CurrentWeather;
