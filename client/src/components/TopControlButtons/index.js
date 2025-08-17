import React, { useContext } from "react";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";
import { InlineIcon } from "@iconify/react";
import locationArrow from "@iconify/icons-map/location-arrow";
import contrastIcon from "@iconify/icons-carbon/contrast";
import sharpSettings from "@iconify/icons-ic/sharp-settings";
import roundLocationOn from "@iconify/icons-ic/round-location-on";
import roundLocationOff from "@iconify/icons-ic/round-location-off";
import playFilledAlt from "@iconify/icons-carbon/play-filled-alt";
import stopFilledAlt from "@iconify/icons-carbon/stop-filled-alt";

/**
 * Top control buttons component
 *
 * @returns {JSX.Element} Top control buttons
 */
const TopControlButtons = () => {
  const {
    darkMode,
    autoDarkMode,
    toggleDarkMode,
    resetMapPosition,
    markerIsVisible,
    toggleMarker,
    toggleAnimateWeatherMap,
    animateWeatherMap,
    toggleSettingsMenuOpen,
    settingsMenuOpen,
  } = useContext(AppContext);

  return (
    <div className={styles.topControlContainer}>
      <div 
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light}`}
        onClick={resetMapPosition}
        title="Reset map position"
      >
        <InlineIcon icon={locationArrow} />
      </div>
      <div 
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light}`}
        onClick={toggleMarker}
        title={markerIsVisible ? "Hide marker" : "Show marker"}
      >
        <InlineIcon
          icon={markerIsVisible ? roundLocationOff : roundLocationOn}
        />
      </div>
      <div
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light} ${animateWeatherMap ? styles.active : ""}`}
        onClick={toggleAnimateWeatherMap}
        title={animateWeatherMap ? "Stop animation" : "Start animation"}
      >
        <InlineIcon icon={animateWeatherMap ? stopFilledAlt : playFilledAlt} />
      </div>
      <div 
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light} ${autoDarkMode ? styles.autoMode : ""}`}
        onClick={toggleDarkMode}
        title={autoDarkMode ? "Auto mode - Click for Light" : (!darkMode ? "Light mode - Click for Dark" : "Dark mode - Click for Auto")}
      >
        <InlineIcon icon={contrastIcon} />
      </div>
      <div
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light} ${settingsMenuOpen ? styles.active : ""}`}
        onClick={toggleSettingsMenuOpen}
        title="Settings"
      >
        <InlineIcon icon={sharpSettings} />
      </div>
    </div>
  );
};

export default TopControlButtons;