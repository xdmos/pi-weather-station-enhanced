import React, { useState, useEffect } from "react";
import styles from "./styles.css";
import axios from "axios";

/**
 * System information component
 *
 * @returns {JSX.Element} System info component
 */
const SystemInfo = () => {
  const [cpuTemp, setCpuTemp] = useState(null);
  const [fanSpeed, setFanSpeed] = useState(null);

  useEffect(() => {
    const fetchSystemInfo = () => {
      axios.get("/system-info")
        .then((res) => {
          if (res.data) {
            setCpuTemp(res.data.cpuTemp);
            setFanSpeed(res.data.fanSpeed);
          }
        })
        .catch((err) => {
          console.error("Error fetching system info:", err);
        });
    };

    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTemp = (temp) => {
    if (temp === null || temp === undefined) return "--";
    return `${temp.toFixed(1)}°C`;
  };

  const formatFanSpeed = (speed) => {
    if (speed === null || speed === undefined) return "--";
    // If speed is less than 100, it's probably a percentage
    if (speed <= 100) {
      return `${Math.round(speed)}%`;
    }
    // Otherwise it's RPM
    return `${Math.round(speed)} RPM`;
  };

  return (
    <div className={styles.systemInfoContainer}>
      <div className={styles.systemInfoBox}>
        <div className={styles.systemInfoLabel}>CPU Temp:</div>
        <div className={styles.systemInfoValue}>{formatTemp(cpuTemp)}</div>
      </div>
      <div className={styles.systemInfoBox}>
        <div className={styles.systemInfoLabel}>Fan:</div>
        <div className={styles.systemInfoValue}>{formatFanSpeed(fanSpeed)}</div>
      </div>
    </div>
  );
};

export default SystemInfo;