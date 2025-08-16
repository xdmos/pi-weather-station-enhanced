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
 * Buttons group component
 *
 * @returns {JSX.Element} Control buttons
 */
const ControlButtons = () => {
  const {
    darkMode,
    autoDarkMode,
    toggleDarkMode,
    toggleDarkModeType,
    resetMapPosition,
    markerIsVisible,
    toggleMarker,
    toggleAnimateWeatherMap,
    animateWeatherMap,
    toggleSettingsMenuOpen,
    settingsMenuOpen,
    mouseHide,
  } = useContext(AppContext);

  return (
    <div
      className={`${styles.container} ${
        darkMode ? styles.dark : styles.light
      } ${!mouseHide ? styles.showMouse : ""}`}
    >
      <div onClick={resetMapPosition}>
        <InlineIcon icon={locationArrow} />
      </div>
      <div onClick={toggleMarker}>
        <InlineIcon
          icon={markerIsVisible ? roundLocationOff : roundLocationOn}
        />
      </div>
      <div
        onClick={toggleAnimateWeatherMap}
        className={`${animateWeatherMap ? styles.buttonDown : ""}`}
      >
        <InlineIcon icon={animateWeatherMap ? stopFilledAlt : playFilledAlt} />
      </div>
      <div 
        onClick={toggleDarkMode}
        onContextMenu={(e) => {
          e.preventDefault();
          toggleDarkModeType();
        }}
        style={{ 
          position: 'relative',
          opacity: autoDarkMode && !darkMode ? 0.7 : 1 
        }}
        title={autoDarkMode ? "Auto mode (right-click for manual)" : "Manual mode (right-click for auto)"}
      >
        <InlineIcon icon={contrastIcon} />
        {autoDarkMode && (
          <div style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#4a90e2',
            border: '1px solid white'
          }} />
        )}
      </div>
      <div
        onClick={toggleSettingsMenuOpen}
        className={`${settingsMenuOpen ? styles.buttonDown : ""}`}
      >
        <InlineIcon icon={sharpSettings} />
      </div>
    </div>
  );
};

export default ControlButtons;
