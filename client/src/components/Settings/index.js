import React, { useContext, useState, useEffect } from "react";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";
import { CSSTransition } from "react-transition-group";
import { InlineIcon } from "@iconify/react";
import closeFilled from "@iconify/icons-carbon/close-filled";
import roundSaveAlt from "@iconify/icons-ic/round-save-alt";
import undoIcon from "@iconify/icons-dashicons/undo";
import closeSharp from "@iconify/icons-ion/close-sharp";
import PropTypes from "prop-types";
import "!style-loader!css-loader!./animations.css";

/**
 * Settings page
 *
 * @returns {JSX.Element} Settings page
 */
const Settings = () => {
  const {
    settingsMenuOpen,
    mapApiKey,
    reverseGeoApiKey,
    customLat,
    customLon,
    setSettingsMenuOpen,
    mouseHide,
    saveMouseHide,
  } = useContext(AppContext);

  const [mapsKey, setMapsKey] = useState(null);
  const [geoKey, setGeoKey] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const [currentMapsKey, setCurrentMapsKey] = useState(null);
  const [currentGeoKey, setCurrentGeoKey] = useState(null);
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLon, setCurrentLon] = useState(null);

  useEffect(() => {
    setCurrentMapsKey(mapApiKey);
    setCurrentGeoKey(reverseGeoApiKey);
    setCurrentLat(customLat);
    setCurrentLon(customLon);
  }, [
    mapApiKey,
    reverseGeoApiKey,
    customLat,
    customLon,
    currentGeoKey,
    mouseHide,
    saveMouseHide,
  ]);

  useEffect(() => {
    if (mapApiKey) {
      setMapsKey(mapApiKey);
    }
    if (reverseGeoApiKey) {
      setGeoKey(reverseGeoApiKey);
    }
    if (customLat) {
      setLat(customLat);
    }
    if (customLon) {
      setLon(customLon);
    }
  }, [mapApiKey, reverseGeoApiKey, customLon, customLat]);

  return (
    <CSSTransition
      in={settingsMenuOpen}
      unmountOnExit
      timeout={300}
      classNames="animate"
    >
      <div className={styles.container}>
        <div className={styles.header}>SETTINGS</div>
        <div
          className={styles.closeButton}
          onClick={() => {
            setSettingsMenuOpen(false);
          }}
        >
          <InlineIcon icon={closeSharp} />
        </div>
        <div className={styles.settingsContainer}>
          <ToggleButtons />
          <ScreensaverSettings />
          <div className={styles.bottomButtonContainer}>
            <div>
              <div className={styles.label}>HIDE MOUSE</div>
              <ToggleButton
                button1Label={"ON"}
                button2Label={"OFF"}
                val={mouseHide}
                button1Val={true}
                button2Val={false}
                cb={saveMouseHide}
              />
            </div>
            <div className={styles.saveButtonContainer}>
              <SaveButton
                mapsKey={mapsKey}
                geoKey={geoKey}
                lat={lat}
                lon={lon}
              />
            </div>
          </div>
          <div className={styles.apiKeysSection}>
            <Input
              label={"CUSTOM STARTING LATITUDE"}
              val={lat}
              cb={setLat}
              current={currentLat}
            />
            <Input
              label={"CUSTOM STARTING LONGITUDE"}
              val={lon}
              cb={setLon}
              current={currentLon}
            />
            <Input
              label={"MAPS API KEY"}
              val={mapsKey}
              current={currentMapsKey}
              cb={setMapsKey}
              required={true}
            />
            <Input
              label={"GEOLOCATION API KEY (OPTIONAL)"}
              val={geoKey}
              current={currentGeoKey}
              cb={setGeoKey}
            />
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Settings;

/**
 * Save button
 *
 * @param {Object} props
 * @param {String} [props.mapsKey]
 * @param {String} [props.geoKey]
 * @param {String} [props.lat]
 * @param {String} [props.lon]
 * @returns {JSX.Element} Save button
 */
const SaveButton = ({ mapsKey, geoKey, lat, lon }) => {
  const { saveSettingsToJson, setSettingsMenuOpen, mouseHide } = useContext(
    AppContext
  );
  return (
    <div
      className={`${styles.button} ${styles.saveButton} ${
        !mouseHide ? styles.showMouse : ""
      }`}
      onClick={() => {
        saveSettingsToJson({ mapsKey, weatherKey: null, geoKey, lat, lon })
          .then(() => {
            setSettingsMenuOpen(false);
          })
          .catch((err) => {
            console.log("err!", err);
          });
      }}
    >
      <div className={styles.label}>SAVE</div>
      <div>
        <InlineIcon icon={roundSaveAlt} />
      </div>
    </div>
  );
};

SaveButton.propTypes = {
  mapsKey: PropTypes.string,
  geoKey: PropTypes.string,
  lat: PropTypes.string,
  lon: PropTypes.string,
};

/**
 * Toggle Buttons Group
 *
 * @returns {JSX.Element} A grouping of toggle buttons
 */
const ToggleButtons = () => {
  const {
    tempUnit,
    saveTempUnit,
    speedUnit,
    saveSpeedUnit,
    lengthUnit,
    saveLengthUnit,
    clockTime,
    saveClockTime,
  } = useContext(AppContext);

  return (
    <div>
      <div className={styles.label}>UNITS</div>
      <div className={styles.toggleButtons}>
        <div>
          <ToggleButton
            button1Label={"F"}
            button2Label={"C"}
            val={tempUnit}
            button1Val={"f"}
            button2Val={"c"}
            cb={saveTempUnit}
          />
        </div>
        <div>
          <ToggleButton
            button1Label={"mph"}
            button2Label={"m/s"}
            val={speedUnit}
            button1Val={"mph"}
            button2Val={"ms"}
            cb={saveSpeedUnit}
          />
        </div>
        <div>
          <ToggleButton
            button1Label={"in"}
            button2Label={"mm"}
            val={lengthUnit}
            button1Val={"in"}
            button2Val={"mm"}
            cb={saveLengthUnit}
          />
        </div>
        <div>
          <ToggleButton
            button1Label={"12h"}
            button2Label={"24h"}
            val={clockTime}
            button1Val={"12"}
            button2Val={"24"}
            cb={saveClockTime}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Toggle buttons
 *
 * @param {Object} props
 * @param {String} props.button1Label PropTypes.string.isRequired,
 * @param {String} props.button2Label PropTypes.string.isRequired,
 * @param {*} props.val PropTypes.string.isRequired,
 * @param {*} props.button1Val PropTypes.string.isRequired,
 * @param {*} props.button2Val PropTypes.string.isRequired,
 * @param {Function} props.cb PropTypes.func.isRequired,
 * @returns {JSX.Element} Toggle buttons
 */
const ToggleButton = ({
  button1Label,
  button2Label,
  val,
  button1Val,
  button2Val,
  cb,
}) => {
  return (
    <div className={styles.toggleContainer}>
      <div
        className={` ${styles.button} ${button1Val === val ? styles.down : ""}`}
        onClick={() => {
          cb(button1Val);
        }}
      >
        {button1Label}
      </div>
      <div
        className={` ${styles.button} ${button2Val === val ? styles.down : ""}`}
        onClick={() => {
          cb(button2Val);
        }}
      >
        {button2Label}
      </div>
    </div>
  );
};

ToggleButton.propTypes = {
  button1Label: PropTypes.string.isRequired,
  button2Label: PropTypes.string.isRequired,
  val: PropTypes.any.isRequired,
  button1Val: PropTypes.any.isRequired,
  button2Val: PropTypes.any.isRequired,
  cb: PropTypes.func.isRequired,
};

/**
 * Delete button
 *
 * @param {Object} props
 * @param {Function} props.cb callback
 * @returns {JSX.Element} Delete button
 */
const DeleteButton = ({ cb }) => {
  return (
    <div className={styles.button} onClick={cb}>
      <InlineIcon icon={closeFilled} />
    </div>
  );
};

DeleteButton.propTypes = {
  cb: PropTypes.func.isRequired,
};

/**
 * Undo button, restores input to default value
 *
 * @param {Object} props
 * @param {Function} props.cb callback
 * @returns {JSX.Element} Undo button
 */
const UndoButton = ({ cb }) => {
  return (
    <div className={styles.button} onClick={cb}>
      <InlineIcon icon={undoIcon} />
    </div>
  );
};

UndoButton.propTypes = {
  cb: PropTypes.func.isRequired,
};

/**
 * Settings input
 *
 * @param {Object} props
 * @param {String} props.label Label
 * @param {String} props.val value
 * @param {Function} props.cb change callback
 * @param {String} props.current current default value
 * @param {Boolean} [props.required] If input is required
 * @returns {JSX.Element} Input
 */
const Input = ({ label, val, cb, required, current }) => {
  const [inputValue, setInputValue] = useState(val);
  const [defaultValue, setDefaultValue] = useState(null);

  useEffect(() => {
    if ((val || val === "") && (!defaultValue || defaultValue === "")) {
      setDefaultValue(val);
    }
    setInputValue(val);
  }, [val, defaultValue]);
  return (
    <div className={styles.settingsItem}>
      <div className={styles.label}>{label}</div>
      <div
        className={`${styles.inputContainer} ${
          required && !val ? styles.invalid : ""
        }`}
      >
        <input
          type="text"
          placeholder={"None"}
          value={inputValue || ""}
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value);
            cb(value);
          }}
        />

        <div className={styles.buttonContainer}>
          <DeleteButton
            cb={() => {
              setInputValue("");
              cb("");
            }}
          />
          <UndoButton
            cb={() => {
              setInputValue(current);
              cb(current);
            }}
          />
        </div>
      </div>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  val: PropTypes.string,
  cb: PropTypes.func.isRequired,
  required: PropTypes.bool,
  current: PropTypes.string,
};

/**
 * Screensaver Settings
 *
 * @returns {JSX.Element} Screensaver settings component
 */
const ScreensaverSettings = () => {
  const {
    screensaverEnabled,
    screensaverTimeout,
    screensaverDuration,
    screensaverType,
    saveScreensaverEnabled,
    saveScreensaverTimeout,
    saveScreensaverDuration,
    saveScreensaverType,
  } = useContext(AppContext);

  return (
    <div className={styles.screensaverSection}>
      <div className={styles.label}>SCREENSAVER</div>
      <div className={styles.screensaverOptions}>
        <div>
          <div className={styles.sublabel}>Enabled</div>
          <ToggleButton
            button1Label={"ON"}
            button2Label={"OFF"}
            val={screensaverEnabled}
            button1Val={true}
            button2Val={false}
            cb={saveScreensaverEnabled}
          />
        </div>
        {screensaverEnabled && (
          <>
            <div>
              <div className={styles.sublabel}>Type</div>
              <select
                value={screensaverType}
                onChange={(e) => saveScreensaverType(e.target.value)}
                className={styles.select}
              >
                <option value="images">Landscape Images</option>
                <option value="video">Nature Videos</option>
                <option value="animation">Abstract Animation</option>
              </select>
            </div>
            <div>
              <div className={styles.sublabel}>Timeout</div>
              <select
                value={screensaverTimeout}
                onChange={(e) => saveScreensaverTimeout(parseInt(e.target.value))}
                className={styles.select}
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
            <div>
              <div className={styles.sublabel}>Duration</div>
              <select
                value={screensaverDuration}
                onChange={(e) => saveScreensaverDuration(parseInt(e.target.value))}
                className={styles.select}
              >
                <option value="1">1 minute</option>
                <option value="3">3 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
