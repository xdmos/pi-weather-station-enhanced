import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { Map, TileLayer, AttributionControl, Marker } from "react-leaflet";
import PropTypes from "prop-types";
import { AppContext } from "~/AppContext";
import debounce from "debounce";
import axios from "axios";
import { format } from "date-fns";
import styles from "./styles.css";

/**
 * Weather map
 *
 * @param {Object} props
 * @param {Number} props.zoom zoom level
 * @param {Boolean} [props.dark] dark mode
 * @returns {JSX.Element} Weather map
 */
const WeatherMap = ({ zoom, dark }) => {
  const MAP_CLICK_DEBOUNCE_TIME = 200; //ms
  const {
    setMapPosition,
    panToCoords,
    setPanToCoords,
    browserGeo,
    mapGeo,
    mapApiKey,
    getMapApiKey,
    markerIsVisible,
    sunriseTime,
    sunsetTime,
  } = useContext(AppContext);
  const mapRef = useRef();

  const mapClickHandler = useCallback(
    debounce((e) => {
      const { lat: latitude, lng: longitude } = e.latlng;
      const newCoords = { latitude, longitude };
      setMapPosition(newCoords);
    }, MAP_CLICK_DEBOUNCE_TIME),
    [setMapPosition]
  );

  const [radarFrames, setRadarFrames] = useState([]);
  const [radarHost, setRadarHost] = useState("https://tilecache.rainviewer.com");

  const MAP_TIMESTAMP_REFRESH_FREQUENCY = 1000 * 60 * 3; //update every 3 minutes

  const getMapApiKeyCallback = useCallback(() => getMapApiKey(), [
    getMapApiKey,
  ]);

  useEffect(() => {
    getMapApiKeyCallback().catch((err) => {
      console.log("err!", err);
    });

    const updateTimeStamps = () => {
      console.log("Fetching map timestamps...");
      getMapRadarData()
        .then((res) => {
          console.log("Got radar frames:", res.frames?.length || 0);
          setRadarHost(res.host);
          setRadarFrames(res.frames);
        })
        .catch((err) => {
          console.log("timestamp fetch error", err);
        });
    };

    const mapTimestampsInterval = setInterval(
      updateTimeStamps,
      MAP_TIMESTAMP_REFRESH_FREQUENCY
    );
    updateTimeStamps(); //initial update
    return () => {
      clearInterval(mapTimestampsInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan the screen to a a specific location when `panToCoords` is updated with grid coordinates
  useEffect(() => {
    if (panToCoords && mapRef.current) {
      const { leafletElement } = mapRef.current;
      leafletElement.panTo([panToCoords.latitude, panToCoords.longitude]);
      setPanToCoords(null); //reset back to null so we can observe a change next time its fired for the same coords
    }
  }, [panToCoords, mapRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const { latitude, longitude } = browserGeo || {};

  // For debugging - log when radar frames are loaded
  useEffect(() => {
    if (radarFrames && radarFrames.length > 0) {
      console.log("Timestamps loaded:", radarFrames.length, "items");
    }
  }, [radarFrames]);


  if (!hasVal(latitude) || !hasVal(longitude) || !zoom || !mapApiKey) {
    return (
      <div className={`${styles.noMap} ${dark ? styles.dark : styles.light}`}>
        <div>Cannot retrieve map data.</div>
        <div>Did you enter an API key?</div>
      </div>
    );
  }
  const markerPosition = mapGeo ? [mapGeo.latitude, mapGeo.longitude] : null;
  const latestRadarFrame =
    radarFrames && radarFrames.length > 0
      ? radarFrames[radarFrames.length - 1]
      : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        touchZoom={true}
        dragging={true}
        fadeAnimation={false}
        onClick={mapClickHandler}
      >
        <AttributionControl position={"bottomleft"} />
        <TileLayer
          attribution='© <a href="https://www.mapbox.com/feedback/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/${
            dark ? "dark-v10" : "light-v10"
          }/tiles/{z}/{x}/{y}?access_token={apiKey}`}
          apiKey={mapApiKey}
        />
        {latestRadarFrame ? (
          <TileLayer
            key={latestRadarFrame.time || latestRadarFrame.path}
            attribution='<a href="https://www.rainviewer.com/">RainViewer</a>'
            url={`${radarHost}${latestRadarFrame.path}/512/{z}/{x}/{y}/6/1_1.png`}
            opacity={0.7}
            maxNativeZoom={7}
          />
        ) : null}
        {markerIsVisible && markerPosition ? (
          <Marker position={markerPosition} opacity={0.65}></Marker>
        ) : null}
      </Map>
      
      {/* Date, time, sunrise/sunset overlay in bottom left */}
      <div className={`${styles.clockOverlay} ${dark ? styles.clockOverlayDark : styles.clockOverlayLight}`}>
        <div className={styles.dateText}>
          {format(new Date(), "cccc").toUpperCase()}{" "}
          {format(new Date(), "LLLL").toUpperCase()} {format(new Date(), "d")}
        </div>
        <div className={styles.timeText}>
          {format(new Date(), "HH:mm")}
        </div>
        <div className={styles.sunTimesContainer}>
          <div className={styles.sunTime}>
            ☀ {sunriseTime ? format(new Date(sunriseTime), "HH:mm") : ""}
          </div>
          <div className={styles.sunTime}>
            ● {sunsetTime ? format(new Date(sunsetTime), "HH:mm") : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

WeatherMap.propTypes = {
  zoom: PropTypes.number.isRequired,
  dark: PropTypes.bool,
};

/**
 * Weather layer
 *
 * @param {Object} props
 * @param {String} props.layer
 * @param {String} props.weatherApiKey
 * @returns {JSX.Element} Weather layer
 */
const WeatherLayer = ({ layer, weatherApiKey }) => {
  return (
    <TileLayer
      attribution='&amp;copy <a href="https://openweathermap.org/">OpenWeather</a>'
      url={`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`}
      apiKey
    />
  );
};

WeatherLayer.propTypes = {
  layer: PropTypes.string.isRequired,
  weatherApiKey: PropTypes.string,
};

/**
 * Determines if truthy, but returns true for 0
 *
 * @param {*} i
 * @returns {Boolean} If truthy or zero
 */
function hasVal(i) {
  return !!(i || i === 0);
}

/**
 * Get current radar frame metadata for weather map
 *
 * @returns {Promise<{host: String, frames: Array<{time: Number, path: String}>}>}
 */
function getMapRadarData() {
  const defaultHost = "https://tilecache.rainviewer.com";

  function loadLegacyFrames() {
    return axios.get("https://api.rainviewer.com/public/maps.json").then((legacyRes) => {
      const legacyFrames = Array.isArray(legacyRes && legacyRes.data)
        ? legacyRes.data
            .filter((timestamp) => Number.isFinite(timestamp))
            .map((timestamp) => ({
              time: timestamp,
              path: `/v2/radar/${timestamp}`,
            }))
        : [];
      return { host: defaultHost, frames: legacyFrames };
    });
  }

  return axios
    .get("https://api.rainviewer.com/public/weather-maps.json")
    .then((res) => {
      const host = (res && res.data && res.data.host) || defaultHost;
      const pastFrames = (res && res.data && res.data.radar && res.data.radar.past) || [];

      if (Array.isArray(pastFrames) && pastFrames.length > 0) {
        const frames = pastFrames
          .filter((frame) => frame && frame.path)
          .map((frame) => ({
            time: frame.time,
            path: frame.path,
          }));

        if (frames.length > 0) {
          return { host, frames };
        }
      }

      return loadLegacyFrames();
    })
    .catch((err) => {
      console.log("weather-maps endpoint failed, falling back to maps.json", err);
      return loadLegacyFrames();
    });
}

export default WeatherMap;
