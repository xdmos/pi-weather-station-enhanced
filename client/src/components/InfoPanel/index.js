import React, { useContext } from "react";
import { AppContext } from "~/AppContext";
import Clock from "~/components/Clock";
import WeatherInfo from "~/components/WeatherInfo";
import styles from "./styles.css";

/**
 * Info Panel with organized containers
 *
 * @returns {JSX.Element} Info Panel
 */
const InfoPanel = () => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className={`${darkMode ? styles.dark : styles.light} ${styles.panel}`}>
      <div className={styles.container}>
        {/* Container 1: Date, time, sunrise/sunset */}
        <div className={styles.headerContainer}>
          <Clock />
        </div>
        
        {/* Container 2-5: Weather components */}
        <div className={styles.weatherContainer}>
          <WeatherInfo />
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
