import React, { useContext } from "react";
import axios from "axios";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";
import { InlineIcon } from "@iconify/react";
import locationArrow from "@iconify/icons-map/location-arrow";
import contrastIcon from "@iconify/icons-carbon/contrast";
import minimizeIcon from "@iconify/icons-carbon/minimize";
import sharpSettings from "@iconify/icons-ic/sharp-settings";
import roundLocationOn from "@iconify/icons-ic/round-location-on";
import cursorIcon from "@iconify/icons-carbon/cursor-1";

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
    toggleSettingsMenuOpen,
    settingsMenuOpen,
    mouseHide,
    saveMouseHide,
  } = useContext(AppContext);

  const toggleMouseVisibility = () => {
    saveMouseHide(!mouseHide);
  };

  const minimizeWindow = () => {
    axios.post("/window/minimize").catch((err) => {
      console.error("Error minimizing window:", err);
    });
  };

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
          icon={roundLocationOn}
          style={{ color: markerIsVisible ? (darkMode ? '#ffffff' : '#000000') : '#666666' }}
        />
      </div>
      <div
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light}`}
        onClick={toggleMouseVisibility}
        title={mouseHide ? "Show mouse cursor" : "Hide mouse cursor"}
      >
        <InlineIcon 
          icon={cursorIcon} 
          style={{ color: mouseHide ? '#666666' : (darkMode ? '#ffffff' : '#000000') }}
        />
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
      <div
        className={`${styles.controlButton} ${darkMode ? styles.dark : styles.light}`}
        onClick={minimizeWindow}
        title="Minimize window"
      >
        <InlineIcon icon={minimizeIcon} />
      </div>
    </div>
  );
};

export default TopControlButtons;