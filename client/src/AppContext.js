import React, { createContext, useState, useEffect, useCallback } from "react";
import { getSettings } from "~/settings";
import PropTypes from "prop-types";
import { getCoordsFromApi } from "~/services/geolocation";
import axios from "axios";

export const AppContext = createContext();

const TEMP_UNIT_STORAGE_KEY = "tempUnit";
const SPEED_UNIT_STORAGE_KEY = "speedUnit";
const LENGTH_UNIT_STORAGE_KEY = "lengthUnit";
const CLOCK_UNIT_STORAGE_KEY = "clockTime";
const MOUSE_HIDE_STORAGE_KEY = "mouseHide";
const SCREENSAVER_ENABLED_KEY = "screensaverEnabled";
const SCREENSAVER_TIMEOUT_KEY = "screensaverTimeout";
const SCREENSAVER_DURATION_KEY = "screensaverDuration";
const SCREENSAVER_TYPE_KEY = "screensaverType";

/**
 * App context provider
 *
 * @param {Object} props
 * @param {Node} props.children
 * @returns {JSX.Element} Context provider
 */
export function AppContextProvider({ children }) {
  const [weatherApiKey, setWeatherApiKey] = useState(null);
  const [mapApiKey, setMapApiKey] = useState(null);
  const [reverseGeoApiKey, setReverseGeoApiKey] = useState(null);
  const [browserGeo, setBrowserGeo] = useState(null);
  const [mapGeo, setMapGeo] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [autoDarkMode, setAutoDarkMode] = useState(true); // Auto mode based on sunrise/sunset
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [currentWeatherDataErr, setCurrentWeatherDataErr] = useState(null);
  const [currentWeatherDataErrMsg, setCurrentWeatherDataErrMsg] = useState(
    null
  );
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [hourlyWeatherDataErr, setHourlyWeatherDataErr] = useState(null);
  const [hourlyWeatherDataErrMsg, setHourlyWeatherDataErrMsg] = useState(null);
  const [dailyWeatherData, setDailyWeatherData] = useState(null);
  const [dailyWeatherDataErr, setDailyWeatherDataErr] = useState(null);
  const [dailyWeatherDataErrMsg, setDailyWeatherDataErrMsg] = useState(null);
  const [panToCoords, setPanToCoords] = useState(null);
  const [markerIsVisible, setMarkerIsVisible] = useState(true);
  const [tempUnit, setTempUnit] = useState("f"); // fahrenheit or celsius
  const [speedUnit, setSpeedUnit] = useState("mph"); // mph or ms for m/s
  const [lengthUnit, setLengthUnit] = useState("in"); // in or mm
  const [clockTime, setClockTime] = useState("12"); // 12h or 24h time for clock
  const [animateWeatherMap, setAnimateWeatherMap] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [customLat, setCustomLat] = useState(null);
  const [customLon, setCustomLon] = useState(null);
  const [mouseHide, setMouseHide] = useState(false);
  const [sunriseTime, setSunriseTime] = useState(null);
  const [sunsetTime, setSunsetTime] = useState(null);
  const [screensaverActive, setScreensaverActive] = useState(false);
  const [screensaverEnabled, setScreensaverEnabled] = useState(true);
  const [screensaverTimeout, setScreensaverTimeout] = useState(60); // minutes
  const [screensaverDuration, setScreensaverDuration] = useState(3); // minutes
  const [screensaverType, setScreensaverType] = useState("images"); // images, video, animation
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  /**
   * Check if it's currently daylight
   * @returns {Boolean} true if daylight, false if night
   */
  const isDaylight = useCallback(() => {
    if (!sunriseTime || !sunsetTime) return true; // Default to light if no data
    
    const now = new Date().getTime();
    const sunrise = new Date(sunriseTime).getTime();
    const sunset = new Date(sunsetTime).getTime();
    
    return now > sunrise && now < sunset;
  }, [sunriseTime, sunsetTime]);

  /**
   * Update dark mode automatically based on sunrise/sunset
   */
  const updateAutoDarkMode = useCallback(() => {
    if (autoDarkMode) {
      const isDay = isDaylight();
      setDarkMode(!isDay); // Dark mode when it's night
    }
  }, [autoDarkMode, isDaylight]);

  /**
   * Toggle between auto and manual dark mode
   */
  function toggleDarkModeType() {
    if (autoDarkMode) {
      // Switch to manual mode, keep current state
      setAutoDarkMode(false);
    } else {
      // Switch to auto mode
      setAutoDarkMode(true);
      updateAutoDarkMode();
    }
  }

  /**
   * Manual dark mode toggle (only works when auto mode is off)
   */
  function toggleDarkMode() {
    if (!autoDarkMode) {
      setDarkMode(!darkMode);
    }
  }

  // Auto dark mode effect - check every minute and when sunrise/sunset changes
  useEffect(() => {
    if (autoDarkMode) {
      updateAutoDarkMode();
      
      // Check every minute if we need to update dark mode
      const interval = setInterval(() => {
        updateAutoDarkMode();
      }, 60000); // 1 minute
      
      return () => clearInterval(interval);
    }
  }, [sunriseTime, sunsetTime, autoDarkMode, updateAutoDarkMode]);

  // Screensaver timeout check
  useEffect(() => {
    if (!screensaverEnabled || screensaverActive) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;
      const timeoutMs = screensaverTimeout * 60 * 1000;

      if (timeSinceLastActivity >= timeoutMs) {
        activateScreensaver();
      }
    };

    // Check every minute
    const interval = setInterval(checkInactivity, 60000);
    
    // Also check immediately in case we're already past the timeout
    checkInactivity();

    return () => clearInterval(interval);
  }, [screensaverEnabled, screensaverActive, lastActivityTime, screensaverTimeout]);

  // Activity detection
  useEffect(() => {
    const handleActivity = () => {
      recordActivity();
    };

    // Add event listeners for various activity types
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('wheel', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('wheel', handleActivity);
    };
  }, []);

  /**
   * Save mouse hide state
   *
   * @param {Boolean} newVal
   */
  function saveMouseHide(newVal) {
    let newState;
    try {
      newState = JSON.parse(newVal);
    } catch (e) {
      console.log("saveMouseHide", e);
      return;
    }
    setMouseHide(newState);
    window.localStorage.setItem(MOUSE_HIDE_STORAGE_KEY, newState);
  }

  /**
   * Save clock time
   *
   * @param {String} newVal `12` or `24`
   */
  function saveClockTime(newVal) {
    setClockTime(newVal);
    window.localStorage.setItem(CLOCK_UNIT_STORAGE_KEY, newVal);
  }

  /**
   * Save temp unit
   *
   * @param {String} newVal `f` or `c`
   */
  function saveTempUnit(newVal) {
    setTempUnit(newVal);
    window.localStorage.setItem(TEMP_UNIT_STORAGE_KEY, newVal);
  }

  /**
   * Save speed unit
   *
   * @param {String} newVal `mph` or `ms`
   */
  function saveSpeedUnit(newVal) {
    setSpeedUnit(newVal);
    window.localStorage.setItem(SPEED_UNIT_STORAGE_KEY, newVal);
  }

  /**
   * Save length unit
   *
   * @param {String} newVal  `in` or `mm`
   */
  function saveLengthUnit(newVal) {
    setLengthUnit(newVal);
    window.localStorage.setItem(LENGTH_UNIT_STORAGE_KEY, newVal);
  }

  function loadStoredData() {
    const temp = window.localStorage.getItem(TEMP_UNIT_STORAGE_KEY);
    const speed = window.localStorage.getItem(SPEED_UNIT_STORAGE_KEY);
    const length = window.localStorage.getItem(LENGTH_UNIT_STORAGE_KEY);
    const clock = window.localStorage.getItem(CLOCK_UNIT_STORAGE_KEY);
    const screensaverEnabledVal = window.localStorage.getItem(SCREENSAVER_ENABLED_KEY);
    const screensaverTimeoutVal = window.localStorage.getItem(SCREENSAVER_TIMEOUT_KEY);
    const screensaverDurationVal = window.localStorage.getItem(SCREENSAVER_DURATION_KEY);
    const screensaverTypeVal = window.localStorage.getItem(SCREENSAVER_TYPE_KEY);

    let mouseHide;
    try {
      mouseHide = JSON.parse(
        window.localStorage.getItem(MOUSE_HIDE_STORAGE_KEY)
      );
    } catch (e) {
      console.log("mouseHide", e);
    }

    setMouseHide(!!mouseHide);
    if (temp) {
      setTempUnit(temp);
    }
    if (speed) {
      setSpeedUnit(speed);
    }
    if (length) {
      setLengthUnit(length);
    }
    if (clock) {
      setClockTime(clock);
    }
    if (screensaverEnabledVal !== null) {
      setScreensaverEnabled(screensaverEnabledVal === 'true');
    }
    if (screensaverTimeoutVal) {
      setScreensaverTimeout(parseInt(screensaverTimeoutVal));
    }
    if (screensaverDurationVal) {
      setScreensaverDuration(parseInt(screensaverDurationVal));
    }
    if (screensaverTypeVal) {
      setScreensaverType(screensaverTypeVal);
    }
  }

  /**
   * Set custom starting lat/lon
   *
   * @returns {Promise} lat/lon
   * @private
   */
  function getCustomLatLon() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (res) {
            const { startingLat, startingLon } = res;
            if (startingLat) {
              setCustomLat(startingLat);
            }
            if (startingLon) {
              setCustomLon(startingLon);
            }
          }
          resolve(res);
        })
        .catch((err) => {
          console.log("could not read settings.json", err);
          reject(err);
        });
    });
  }

  /**
   * Set the map to a given position
   *
   * @param {Object} coords coordinates
   * @param {String} coords.latitude
   * @param {String} coords.longitude
   */
  function setMapPosition(coords) {
    updateCurrentWeatherData(coords);
    updateHourlyWeatherData(coords);
    updateDailyWeatherData(coords);
    setMapGeo(coords);
    setPanToCoords(coords);
  }

  /**
   * Return the map position to browser geolocation coordinates
   */
  function resetMapPosition() {
    setMapPosition(browserGeo);
  }

  /**
   * Gets geolocation and sets it, unless custom starting coordinates are provided.
   *
   * @returns {Object} coords
   */
  function getBrowserGeo() {
    return new Promise((resolve, reject) => {
      getCustomLatLon()
        .then((res) => {
          const { startingLat, startingLon } = res;
          if (startingLat && startingLon) {
            const latLon = {
              latitude: parseFloat(startingLat),
              longitude: parseFloat(startingLon),
            };
            setBrowserGeo(latLon);
            setMapGeo(latLon); //Set initial map coords to custom lat/lon
            resolve(latLon);
          } else {
            getCoordsFromApi()
              .then((res) => {
                if (!res) {
                  return reject("Could not get browser geolocation data");
                }
                const { latitude, longitude } = res;
                setBrowserGeo({ latitude, longitude });
                setMapGeo({ latitude, longitude }); //Set initial map coords to browser geolocation
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          }
        })
        .catch((err) => {
          console.log("err!", err);
        });
    });
  }

  /**
   * Retrieves weather API key and sets it
   *
   * @returns {Promise} Weather API Key
   */
  function getWeatherApiKey() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (!res || (res && !res.weatherApiKey)) {
            setSettingsMenuOpen(true);
            return reject("Weather API key missing");
          }
          setWeatherApiKey(res && res.weatherApiKey ? res.weatherApiKey : null);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Retrieves map API key and sets it
   *
   * @returns {Promise} Weather API Key
   */
  function getMapApiKey() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (!res || (res && !res.mapApiKey)) {
            setSettingsMenuOpen(true);
            return reject("Map API key missing!");
          }
          setMapApiKey(res && res.mapApiKey ? res.mapApiKey : null);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Retrieves reverse geolocation API key and sets it
   *
   * @returns {Promise} Weather API Key
   */
  function getReverseGeoApiKey() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (!res || (res && !res.reverseGeoApiKey)) {
            return reject("Reverse geolocation API key missing!");
          }
          setReverseGeoApiKey(
            res && res.reverseGeoApiKey ? res.reverseGeoApiKey : null
          );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Updates hourly weather data
   *
   * @param {Object} coords
   * @param {Number} coords.latitude latitude
   * @param {Number} coords.longitude longitude
   *
   * @returns {Promise} hourly weather data
   */
  function updateHourlyWeatherData(coords) {
    setHourlyWeatherDataErr(null);
    setHourlyWeatherDataErrMsg(null);
    const { latitude, longitude } = coords;

    return new Promise((resolve, reject) => {
      if (!coords) {
        setHourlyWeatherDataErr(true);
        return reject("No coords");
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m&timezone=auto&forecast_days=1`;
      
      axios
        .get(url)
        .then((res) => {
          if (!res) {
            return reject({ message: "No response" });
          }
          const { data } = res;
          setHourlyWeatherData(data);
          resolve(data);
        })
        .catch((err) => {
          setHourlyWeatherDataErr(true);
          if (err && err.message) {
            setHourlyWeatherDataErrMsg(err.message);
          }
          reject(err);
        });
    });
  }

  /**
   * Updates daily  weather data
   *
   * @param {Object} coords
   * @param {Number} coords.latitude latitude
   * @param {Number} coords.longitude longitude
   *
   * @returns {Promise} daily weather data
   */
  function updateDailyWeatherData(coords) {
    setDailyWeatherDataErr(null);
    setDailyWeatherDataErrMsg(null);
    const { latitude, longitude } = coords;

    return new Promise((resolve, reject) => {
      if (!coords) {
        setDailyWeatherDataErr(true);
        return reject("No coords");
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=5`;
      
      axios
        .get(url)
        .then((res) => {
          if (!res) {
            return reject({ message: "No response" });
          }
          const { data } = res;
          setDailyWeatherData(data);
          resolve(data);
        })
        .catch((err) => {
          setDailyWeatherDataErr(true);
          if (err && err.message) {
            setDailyWeatherDataErrMsg(err.message);
          }
          reject(err);
        });
    });
  }

  function updateSunriseSunset(coords) {
    return new Promise((resolve, reject) => {
      if (!coords) {
        setSunriseTime(null);
        setSunsetTime(null);
        return reject("No coords");
      }
      const { latitude, longitude } = coords;

      axios
        .get(
          `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
        )
        .then((res) => {
          const { results } = res?.data;
          if (results) {
            const { sunrise, sunset } = results;
            setSunriseTime(sunrise);
            setSunsetTime(sunset);
          } else {
            setSunriseTime(null);
            setSunsetTime(null);
          }
          resolve(results);
        })
        .catch((err) => {
          setSunriseTime(null);
          setSunsetTime(null);
          reject(err);
        });
    });
  }

  /**
   * Updates current weather data
   *
   * @param {Object} coords
   * @param {Number} coords.latitude latitude
   * @param {Number} coords.longitude longitude
   *
   * @returns {Promise} current weather data
   */
  function updateCurrentWeatherData(coords) {
    setCurrentWeatherDataErr(null);
    setCurrentWeatherDataErrMsg(null);
    const { latitude, longitude } = coords;

    return new Promise((resolve, reject) => {
      if (!coords) {
        setCurrentWeatherDataErr(true);
        return reject("No coords");
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,cloud_cover&timezone=auto`;
      console.log('Open-Meteo API request:', url);
      
      axios
        .get(url)
        .then((res) => {
          console.log('Open-Meteo API response:', res.data);
          if (!res) {
            return reject({ message: "No response" });
          }
          const { data } = res;
          setCurrentWeatherData(data);
          resolve(data);
        })
        .catch((err) => {
          console.log('Open-Meteo API error:', err);
          setCurrentWeatherDataErr(true);
          if (err && err.message) {
            setCurrentWeatherDataErrMsg(err.message);
          }
          reject(err);
        });
    });
  }

  /**
   * Toggles the marker on and off
   */
  function toggleMarker() {
    setMarkerIsVisible(!markerIsVisible);
  }

  /**
   * Toggles weather map animation on/off
   */
  function toggleAnimateWeatherMap() {
    setAnimateWeatherMap(!animateWeatherMap);
  }

  /**
   * Toggles settings menu open/closed
   */
  function toggleSettingsMenuOpen() {
    setSettingsMenuOpen(!settingsMenuOpen);
  }

  /**
   * Save screensaver enabled state
   */
  function saveScreensaverEnabled(value) {
    setScreensaverEnabled(value);
    window.localStorage.setItem(SCREENSAVER_ENABLED_KEY, value.toString());
  }

  /**
   * Save screensaver timeout
   */
  function saveScreensaverTimeout(value) {
    setScreensaverTimeout(value);
    window.localStorage.setItem(SCREENSAVER_TIMEOUT_KEY, value.toString());
  }

  /**
   * Save screensaver duration
   */
  function saveScreensaverDuration(value) {
    setScreensaverDuration(value);
    window.localStorage.setItem(SCREENSAVER_DURATION_KEY, value.toString());
  }

  /**
   * Save screensaver type
   */
  function saveScreensaverType(value) {
    setScreensaverType(value);
    window.localStorage.setItem(SCREENSAVER_TYPE_KEY, value);
  }

  /**
   * Activate screensaver
   */
  function activateScreensaver() {
    setScreensaverActive(true);
    setTimeout(() => {
      deactivateScreensaver();
    }, screensaverDuration * 60 * 1000);
  }

  /**
   * Deactivate screensaver
   */
  function deactivateScreensaver() {
    setScreensaverActive(false);
    setLastActivityTime(Date.now());
  }

  /**
   * Record user activity
   */
  function recordActivity() {
    setLastActivityTime(Date.now());
    if (screensaverActive) {
      deactivateScreensaver();
    }
  }

  /**
   * Get time remaining until screensaver activation (in seconds)
   */
  function getTimeUntilScreensaver() {
    if (!screensaverEnabled || screensaverActive) return 0;
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    const timeoutMs = screensaverTimeout * 60 * 1000;
    const timeRemaining = Math.max(0, timeoutMs - timeSinceActivity);
    return Math.floor(timeRemaining / 1000);
  }

  /**
   * Saves settings to `settings.json`
   *
   * @param {Object} settings
   * @param {String} [settings.mapsKey]
   * @param {String} [settings.weatherKey]
   * @param {String} [settings.geoKey]
   * @param {String} [settings.lat]
   * @param {String} [settings.lon]
   * @returns {Promise} Resolves when complete
   */
  function saveSettingsToJson({ mapsKey, weatherKey, geoKey, lat, lon }) {
    return new Promise((resolve, reject) => {
      axios
        .put("/settings", {
          weatherApiKey: weatherKey,
          mapApiKey: mapsKey,
          reverseGeoApiKey: geoKey,
          startingLat: lat,
          startingLon: lon,
        })
        .then((res) => {
          resolve(res);
          setMapApiKey(mapsKey);
          setWeatherApiKey(weatherKey);
          setReverseGeoApiKey(geoKey);
          setCustomLat(lat);
          setCustomLon(lon);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  const defaultContext = {
    weatherApiKey,
    getWeatherApiKey,
    reverseGeoApiKey,
    getReverseGeoApiKey,
    mapApiKey,
    getMapApiKey,
    browserGeo,
    getBrowserGeo,
    darkMode,
    setDarkMode,
    autoDarkMode,
    setAutoDarkMode,
    toggleDarkMode,
    toggleDarkModeType,
    mapGeo,
    setMapGeo,
    setMapPosition,
    resetMapPosition,
    panToCoords,
    setPanToCoords,
    markerIsVisible,
    toggleMarker,
    tempUnit,
    saveTempUnit,
    speedUnit,
    saveSpeedUnit,
    lengthUnit,
    saveLengthUnit,
    animateWeatherMap,
    toggleAnimateWeatherMap,
    settingsMenuOpen,
    setSettingsMenuOpen,
    toggleSettingsMenuOpen,
    getCustomLatLon,
    customLat,
    customLon,
    loadStoredData,
    clockTime,
    saveClockTime,
    saveSettingsToJson,
    updateCurrentWeatherData,
    updateDailyWeatherData,
    updateHourlyWeatherData,
    currentWeatherData,
    currentWeatherDataErr,
    currentWeatherDataErrMsg,
    hourlyWeatherData,
    hourlyWeatherDataErr,
    hourlyWeatherDataErrMsg,
    dailyWeatherData,
    dailyWeatherDataErr,
    dailyWeatherDataErrMsg,
    mouseHide,
    saveMouseHide,
    updateSunriseSunset,
    sunriseTime,
    sunsetTime,
    screensaverActive,
    screensaverEnabled,
    screensaverTimeout,
    screensaverDuration,
    screensaverType,
    lastActivityTime,
    saveScreensaverEnabled,
    saveScreensaverTimeout,
    saveScreensaverDuration,
    saveScreensaverType,
    activateScreensaver,
    deactivateScreensaver,
    recordActivity,
    getTimeUntilScreensaver,
  };

  return (
    <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
  );
}

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
