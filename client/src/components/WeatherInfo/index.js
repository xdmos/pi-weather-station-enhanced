import React, { useEffect, useContext, useState, useCallback } from "react";
import Spinner from "~/components/Spinner";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";
import LocationName from "~/components/LocationName";
import CurrentWeather from "~/components/CurrentWeather";
import DailyForecastList from "~/components/DailyForecastList";
import HourlyChart from "~/components/weatherCharts/HourlyChart";

const CURRENT_WEATHER_DATA_UPDATE_INTERVAL = 3 * 60 * 1000; //every 3 minutes
const HOURLY_WEATHER_DATA_UPDATE_INTERVAL = 60 * 60 * 1000; //every hour
const DAILY_WEATHER_DATA_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; //every day


/**
 * Displays weather info
 *
 * @returns {JSX.Element} Clock component
 */
const WeatherInfo = () => {
  const {
    getReverseGeoApiKey,
    reverseGeoApiKey,
    updateCurrentWeatherData,
    updateHourlyWeatherData,
    updateDailyWeatherData,
    mapGeo,
    currentWeatherDataErr,
    currentWeatherDataErrMsg,
    darkMode,
    currentWeatherData,
    updateSunriseSunset
  } = useContext(AppContext);

  const [
    currentWeatherUpdateInterval,
    setCurrentWeatherUpdateInterval,
  ] = useState(null);
  const [
    hourlyWeatherUpdateInterval,
    setHourlyWeatherUpdateInterval,
  ] = useState(null);
  const [dailyWeatherUpdateInterval, setDailyWeatherUpdateInterval] = useState(
    null
  );
  const [err, setErr] = useState(null);

  const hourlyWeatherUpdateCb = useCallback(() => {
    updateSunriseSunset(mapGeo);
    updateHourlyWeatherData(mapGeo).catch((err) => {
      console.log("err", err);
    });
  }, [updateHourlyWeatherData, updateSunriseSunset, mapGeo]);

  const dailyWeatherUpdateCb = useCallback(() => {
    updateDailyWeatherData(mapGeo).catch((err) => {
      console.log("err", err);
    });
  }, [updateDailyWeatherData, mapGeo]);

  const currentWeatherUpdateCb = useCallback(() => {
    updateCurrentWeatherData(mapGeo).catch((err) => {
      console.log("err", err);
    });
  }, [updateCurrentWeatherData, mapGeo]);

  useEffect(() => {
    setErr(false);
    if (!reverseGeoApiKey) {
      getReverseGeoApiKey().catch((err) => {
        console.log("error getting reverse geo api key:", err);
      });
    }
  }, [reverseGeoApiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapGeo) return;

    // Clear any existing intervals first
    if (currentWeatherUpdateInterval) {
      clearInterval(currentWeatherUpdateInterval);
      setCurrentWeatherUpdateInterval(null);
    }
    if (hourlyWeatherUpdateInterval) {
      clearInterval(hourlyWeatherUpdateInterval);
      setHourlyWeatherUpdateInterval(null);
    }
    if (dailyWeatherUpdateInterval) {
      clearInterval(dailyWeatherUpdateInterval);
      setDailyWeatherUpdateInterval(null);
    }

    // Create new intervals
    const currentInterval = setInterval(currentWeatherUpdateCb, CURRENT_WEATHER_DATA_UPDATE_INTERVAL);
    const hourlyInterval = setInterval(hourlyWeatherUpdateCb, HOURLY_WEATHER_DATA_UPDATE_INTERVAL);
    const dailyInterval = setInterval(dailyWeatherUpdateCb, DAILY_WEATHER_DATA_UPDATE_INTERVAL);

    // Set state
    setCurrentWeatherUpdateInterval(currentInterval);
    setHourlyWeatherUpdateInterval(hourlyInterval);
    setDailyWeatherUpdateInterval(dailyInterval);

    // Initial calls
    currentWeatherUpdateCb();
    hourlyWeatherUpdateCb();
    dailyWeatherUpdateCb();

    return () => {
      clearInterval(currentInterval);
      clearInterval(hourlyInterval);
      clearInterval(dailyInterval);
    };
  }, [mapGeo]); // eslint-disable-line react-hooks/exhaustive-deps

  console.log('WeatherInfo render:', { currentWeatherData, currentWeatherDataErr, err, mapGeo });
  
  if (currentWeatherData) {
    return (
      <div className={styles.container}>
        {/* Container 1: Location */}
        <div className={styles.locationContainer}>
          <LocationName />
        </div>
        
        {/* Container 2: Current weather with icon and temp */}
        <div className={styles.currentWeatherContainer}>
          <CurrentWeather />
        </div>
        
        {/* Container 3: 24h temperature chart */}
        <div className={styles.chartContainer}>
          <HourlyChart />
        </div>
        
        {/* Container 4: 4 day forecast */}
        <div className={styles.forecastContainer}>
          <DailyForecastList />
        </div>
      </div>
    );
  } else if (currentWeatherDataErr || err) {
    return (
      <div className={styles.container}>
        {/* Container 1: Location - show even when weather data fails */}
        <div className={styles.locationContainer}>
          <LocationName />
        </div>
        
        {/* Weather error message */}
        <div
          className={`${styles.errContainer} ${
            darkMode ? styles.dark : styles.light
          }`}
        >
          <div>Could not retrieve weather data.</div>
          <div>Is your weather API key valid?</div>
          {currentWeatherDataErr ? (
            <div className={styles.message}>{currentWeatherDataErrMsg}</div>
          ) : null}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={"20px"} color={darkMode ? "#f6f6f444" : "#3a393844"} />
      </div>
    );
  }
};

export default WeatherInfo;
