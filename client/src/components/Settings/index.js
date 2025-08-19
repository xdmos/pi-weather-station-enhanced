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
    darkMode,
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
      <div className={`${styles.container} ${darkMode ? styles.darkMode : styles.lightMode}`}>
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
          <div className={styles.bottomButtonContainer}>
            <div className={styles.saveButtonContainer}>
              <SaveButton
                mapsKey={mapsKey}
                geoKey={geoKey}
                lat={lat}
                lon={lon}
              />
            </div>
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
  const { saveSettingsToJson, setSettingsMenuOpen } = useContext(
    AppContext
  );
  return (
    <div
      className={`${styles.button} ${styles.saveButton}`}
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

