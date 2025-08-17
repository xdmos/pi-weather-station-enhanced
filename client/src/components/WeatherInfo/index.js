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
 * Creates an interval to call a weather update callback
 *
 * @param {Object} params
 * @param {Object} params.stateInterval Interval in state
 * @param {Function} params.stateIntervalSetter state interval setter
 * @param {Function} params.cb callback to invoke on each interval
 * @param {Number} params.intervalTime interval frequency, ms
 * @param {Object} params.mapGeo coordinates to get weather for
 */
function createWeatherUpdateInterval({
  stateInterval,
  stateIntervalSetter,
  cb,
  intervalTime,
  mapGeo,
}) {
  if (stateInterval) {
    clearInterval(stateInterval);
    stateIntervalSetter(null);
  }
  if (mapGeo) {
    const interval = setInterval(cb, intervalTime);
    cb();
    stateIntervalSetter(interval);
  }
}

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
    createWeatherUpdateInterval({
      stateInterval: currentWeatherUpdateInterval,
      stateIntervalSetter: setCurrentWeatherUpdateInterval,
      cb: currentWeatherUpdateCb,
      intervalTime: CURRENT_WEATHER_DATA_UPDATE_INTERVAL,
      mapGeo,
    });
    createWeatherUpdateInterval({
      stateInterval: hourlyWeatherUpdateInterval,
      stateIntervalSetter: setHourlyWeatherUpdateInterval,
      cb: hourlyWeatherUpdateCb,
      intervalTime: HOURLY_WEATHER_DATA_UPDATE_INTERVAL,
      mapGeo,
    });
    createWeatherUpdateInterval({
      stateInterval: dailyWeatherUpdateInterval,
      stateIntervalSetter: setDailyWeatherUpdateInterval,
      cb: dailyWeatherUpdateCb,
      intervalTime: DAILY_WEATHER_DATA_UPDATE_INTERVAL,
      mapGeo,
    });
    return () => {
      clearInterval(currentWeatherUpdateInterval);
      clearInterval(hourlyWeatherUpdateInterval);
      clearInterval(dailyWeatherUpdateInterval);
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
