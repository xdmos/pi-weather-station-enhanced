import React, { useEffect, useContext } from "react";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";

import WeatherMap from "~/components/WeatherMap";
import InfoPanel from "~/components/InfoPanel";
import Settings from "~/components/Settings";
import Screensaver from "~/components/Screensaver";
import ScreensaverCountdown from "~/components/ScreensaverCountdown";

import "!style-loader!css-loader!./overrides.css";

/**
 * Main component
 *
 * @returns {JSX.Element} Main component
 */
const App = () => {
  const {
    getBrowserGeo,
    getCustomLatLon,
    loadStoredData,
    darkMode,
    mouseHide,
    screensaverActive,
  } = useContext(AppContext);

  useEffect(() => {
    getCustomLatLon();
    getBrowserGeo();
    loadStoredData();
  }, []);

  // If screensaver is active, show it instead of the main UI
  if (screensaverActive) {
    return <Screensaver />;
  }

  return (
    <div
      className={`${darkMode ? styles.dark : styles.light} ${
        mouseHide ? styles.hideMouse : ""
      }`}
    >
      <div className={styles.container}>
        <div className={styles.settingsContainer}>
          <Settings />
        </div>
        <div
          className={`${styles.weatherMap} map-container ${
            mouseHide ? "map-mouse-hide" : ""
          } ${darkMode ? "map-dark-mode" : ""}`}
        >
          <WeatherMap zoom={9} dark={darkMode} />
        </div>
        <div className={styles.infoContainer}>
          <InfoPanel />
        </div>
      </div>
      <ScreensaverCountdown />
    </div>
  );
};

export default App;
