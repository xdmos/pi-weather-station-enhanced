import React, { useEffect, useContext, useState } from "react";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";

import WeatherMap from "~/components/WeatherMap";
import InfoPanel from "~/components/InfoPanel";
import Settings from "~/components/Settings";
import Screensaver from "~/components/Screensaver";
import ScreensaverCountdown from "~/components/ScreensaverCountdown";
import SystemInfo from "~/components/SystemInfo";
import TopControlButtons from "~/components/TopControlButtons";
import NightClock from "~/components/NightClock";

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

  // Night clock schedule (local browser/device time): 22:00 -> 06:00
  const isNightClockTime = (d) => {
    const mins = d.getHours() * 60 + d.getMinutes();
    return mins >= 22 * 60 || mins < 6 * 60;
  };

  const [nightClockActive, setNightClockActive] = useState(() =>
    isNightClockTime(new Date())
  );

  useEffect(() => {
    const tick = () => setNightClockActive(isNightClockTime(new Date()));
    tick();
    const id = setInterval(tick, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {

    getCustomLatLon();
    getBrowserGeo();
    loadStoredData();
  }, []);

  if (nightClockActive) {
    return <NightClock />;
  }

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
      <SystemInfo />
      <TopControlButtons />
    </div>
  );
};

export default App;
