import React, { useState, useEffect, useContext } from "react";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";

/**
 * Screensaver countdown timer component
 *
 * @returns {JSX.Element} Countdown component
 */
const ScreensaverCountdown = () => {
  const { 
    screensaverEnabled, 
    screensaverActive, 
    getTimeUntilScreensaver 
  } = useContext(AppContext);
  const [timeUntilScreensaver, setTimeUntilScreensaver] = useState(0);

  useEffect(() => {
    if (!screensaverEnabled || screensaverActive) return;

    const updateCountdown = () => {
      setTimeUntilScreensaver(getTimeUntilScreensaver());
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [screensaverEnabled, screensaverActive, getTimeUntilScreensaver]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't show if screensaver is disabled or active
  if (!screensaverEnabled || screensaverActive) {
    return null;
  }

  return (
    <div className={styles.countdown}>
      <div className={styles.label}>Screensaver in:</div>
      <div className={styles.time}>{formatTime(timeUntilScreensaver)}</div>
    </div>
  );
};

export default ScreensaverCountdown;