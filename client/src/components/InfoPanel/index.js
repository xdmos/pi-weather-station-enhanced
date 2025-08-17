import React, { useContext } from "react";
import { AppContext } from "~/AppContext";
import Clock from "~/components/Clock";
import WeatherInfo from "~/components/WeatherInfo";
import styles from "./styles.css";

/**
 * Info Panel
 *
 * @returns {JSX.Element} Info Panel
 */
const InfoPanel = () => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className={`${darkMode ? styles.dark : styles.light} ${styles.panel}`}>
      <div className={styles.container}>
        <div className={styles.clockContainer}>
          <Clock />
        </div>
        <div className={styles.weatherInfoContainer}>
          <WeatherInfo />
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
