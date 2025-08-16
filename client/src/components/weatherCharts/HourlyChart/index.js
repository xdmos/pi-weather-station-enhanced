import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "~/AppContext";
import styles from "../styles.css";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import {
  convertTemp,
  convertLength,
  convertSpeed,
} from "~/services/conversions";
import { fontColor } from "../common";

const chartOptions = ({
  darkMode,
  tempUnit,
  speedUnit,
  lengthUnit,
  altMode,
}) => {
  return {
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    responsive: true,
    hoverMode: "index",
    stacked: false,
    title: {
      display: true,
      text: `24 Hour ${
        altMode
          ? `Wind Speed / Precipitation (${lengthUnit})`
          : `Temp / Precipitation`
      }`,
      fontColor: fontColor(darkMode),
      fontFamily: "Rubik, sans-serif",
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontColor: fontColor(darkMode),
            fontFamily: "Rubik, sans-serif",
          },
        },
      ],
      yAxes: [
        {
          type: "linear",
          display: true,
          position: "left",
          id: "y-axis-1",
          ticks: {
            fontColor: fontColor(darkMode),
            fontFamily: "Rubik, sans-serif",
            maxTicksLimit: 5,
            callback: (val) => {
              return altMode
                ? `${val} ${speedUnit === "mph" ? "mph" : "m/s"}`
                : `${val} ${tempUnit.toUpperCase()}`;
            },
          },
        },
        {
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-2",
          ticks: {
            fontColor: fontColor(darkMode),
            fontFamily: "Rubik, sans-serif",
            maxTicksLimit: 5,
            suggestedMin: 0,
            callback: (val) => {
              return `${val}${altMode ? ` ${lengthUnit}` : "%"}`;
            },
          },
          gridLines: {
            drawOnChartArea: false,
          },
        },
      ],
    },
  };
};

const chartColors = {
  blue: "rgba(63, 127, 191, 0.5)",
  gray: "rgba(127, 127, 127, 0.5)",
};

const mapChartData = ({
  data: weatherData,
  tempUnit,
  speedUnit,
  clockTime,
  altMode,
  lengthUnit,
}) => {
  const hourlyData = weatherData?.hourly;
  if (!hourlyData || !hourlyData.time) {
    return null;
  }
  
  // Take first 24 hours only
  const hoursToShow = 24;
  const times = hourlyData.time.slice(0, hoursToShow);
  const temperatures = hourlyData.temperature_2m?.slice(0, hoursToShow) || [];
  const windSpeeds = hourlyData.wind_speed_10m?.slice(0, hoursToShow) || [];
  const precipitationProb = hourlyData.precipitation_probability?.slice(0, hoursToShow) || [];
  const precipitation = hourlyData.precipitation?.slice(0, hoursToShow) || [];
  
  return {
    labels: times.map((time) => {
      const date = new Date(time);
      if (clockTime === "12") {
        return `${format(date, "h")}${format(date, "aaaaa")}`;
      } else {
        return `${format(date, "HH")}`;
      }
    }),
    datasets: [
      {
        radius: 0,
        label: altMode ? "Wind Speed" : "Temp",
        data: times.map((_, index) => {
          return altMode
            ? convertSpeed(windSpeeds[index] || 0, speedUnit)
            : convertTemp(temperatures[index] || 0, tempUnit);
        }),
        yAxisID: "y-axis-1",
        borderColor: chartColors.gray,
        backgroundColor: chartColors.gray,
        fill: false,
      },
      {
        radius: 0,
        label: "Precipitation",
        data: times.map((_, index) => {
          return altMode
            ? convertLength(precipitation[index] || 0, lengthUnit)
            : (precipitationProb[index] || 0);
        }),
        yAxisID: "y-axis-2",
        borderColor: chartColors.blue,
        backgroundColor: chartColors.blue,
        fill: false,
      },
    ],
  };
};

/**
 * Hourly forecast chart
 *
 * @returns {JSX.Element} Hourly forecast chart
 */
const HourlyChart = () => {
  const {
    hourlyWeatherData,
    tempUnit,
    darkMode,
    clockTime,
    lengthUnit,
    speedUnit,
    hourlyWeatherDataErr,
    hourlyWeatherDataErrMsg,
  } = useContext(AppContext);

  const [altMode, setAltMode] = useState(false);
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    if (hourlyWeatherData) {
      setChartData(
        mapChartData({
          data: hourlyWeatherData,
          tempUnit,
          clockTime,
          lengthUnit,
          speedUnit,
          altMode,
        })
      );
    }
  }, [hourlyWeatherData, tempUnit, clockTime, lengthUnit, altMode, speedUnit]);

  if (chartData) {
    return (
      <div
        className={styles.container}
        onClick={() => {
          setAltMode(!altMode);
        }}
      >
        <Line
          data={chartData}
          options={chartOptions({
            tempUnit,
            darkMode,
            lengthUnit,
            speedUnit,
            altMode,
          })}
        />
      </div>
    );
  } else if (hourlyWeatherDataErr) {
    return (
      <div
        className={`${darkMode ? styles.dark : styles.light} ${
          styles.errContainer
        }`}
      >
        <div>Cannot get 24 hour weather forecast</div>
        <div className={styles.message}>{hourlyWeatherDataErrMsg}</div>
      </div>
    );
  } else {
    return null;
  }
};

export default HourlyChart;
