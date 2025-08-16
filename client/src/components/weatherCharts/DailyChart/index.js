import React, { useContext, useState, useEffect, useCallback } from "react";
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

const createChartOptions = ({
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
      text: `5 Day ${
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
  altMode,
  lengthUnit,
}) => {
  const dailyData = weatherData?.daily;
  if (!dailyData || !dailyData.time) {
    return null;
  }
  
  const times = dailyData.time || [];
  const tempMax = dailyData.temperature_2m_max || [];
  const tempMin = dailyData.temperature_2m_min || [];
  const windSpeeds = dailyData.wind_speed_10m_max || [];
  const precipitationProb = dailyData.precipitation_probability_max || [];
  const precipitation = dailyData.precipitation_sum || [];
  
  // Calculate average temperature for each day
  const avgTemperatures = times.map((_, index) => {
    return (tempMax[index] + tempMin[index]) / 2;
  });
  
  return {
    labels: times.map((time) => {
      const date = new Date(time);
      return format(date, "EEEEE"); // Short day name (Mon, Tue, etc.)
    }),
    datasets: [
      {
        radius: 0,
        label: altMode ? "Wind Speed" : "Temp",
        data: times.map((_, index) => {
          return altMode
            ? convertSpeed(windSpeeds[index] || 0, speedUnit)
            : convertTemp(avgTemperatures[index] || 0, tempUnit);
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
 * Daily forecast chart
 *
 * @returns {JSX.Element} Hourly forecast chart
 */
const DailyChart = () => {
  const {
    dailyWeatherData,
    dailyWeatherDataErr,
    dailyWeatherDataErrMsg,
    tempUnit,
    darkMode,
    lengthUnit,
    speedUnit,
  } = useContext(AppContext);

  const [altMode, setAltMode] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  const setChartDataCallback = useCallback((e) => setChartData(e), []);
  const setChartOptionsCallback = useCallback((e) => setChartOptions(e), []);

  useEffect(() => {
    if (dailyWeatherData) {
      setChartDataCallback(
        mapChartData({
          data: dailyWeatherData,
          tempUnit,
          lengthUnit,
          speedUnit,
          altMode,
        })
      );

      setChartOptionsCallback(
        createChartOptions({
          tempUnit,
          darkMode,
          lengthUnit,
          speedUnit,
          altMode,
        })
      );
    }
  }, [
    dailyWeatherData,
    tempUnit,
    lengthUnit,
    altMode,
    speedUnit,
    darkMode,
    setChartOptionsCallback,
    setChartDataCallback,
  ]);

  if (chartData && chartOptions) {
    return (
      <div
        className={styles.container}
        onClick={() => {
          setAltMode(!altMode);
        }}
      >
        <Line options={chartOptions} data={chartData} />
      </div>
    );
  } else if (dailyWeatherDataErr) {
    return (
      <div
        className={`${darkMode ? styles.dark : styles.light} ${
          styles.errContainer
        }`}
      >
        <div>Cannot get 5 day weather forecast</div>
        <div className={styles.message}>{dailyWeatherDataErrMsg}</div>
      </div>
    );
  } else {
    return null;
  }
};

export default DailyChart;
