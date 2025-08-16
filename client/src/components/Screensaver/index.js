import React, { useState, useEffect, useContext } from "react";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";

const LANDSCAPE_IMAGES = [
  "https://source.unsplash.com/1920x1080/?landscape,nature",
  "https://source.unsplash.com/1920x1080/?mountains,sunset",
  "https://source.unsplash.com/1920x1080/?ocean,waves",
  "https://source.unsplash.com/1920x1080/?forest,trees",
  "https://source.unsplash.com/1920x1080/?aurora,northern-lights",
  "https://source.unsplash.com/1920x1080/?waterfall,nature",
  "https://source.unsplash.com/1920x1080/?beach,tropical",
  "https://source.unsplash.com/1920x1080/?desert,dunes",
  "https://source.unsplash.com/1920x1080/?lake,reflection",
  "https://source.unsplash.com/1920x1080/?clouds,sky"
];

const VIDEO_URLS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
];

/**
 * Screensaver component
 *
 * @returns {JSX.Element} Screensaver component
 */
const Screensaver = () => {
  const { screensaverType, deactivateScreensaver } = useContext(AppContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

  const loadNewImage = () => {
    const baseUrl = LANDSCAPE_IMAGES[currentImageIndex];
    const timestamp = new Date().getTime();
    setImageUrl(`${baseUrl}&t=${timestamp}`);
  };

  useEffect(() => {
    if (screensaverType === "images") {
      loadNewImage();
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % LANDSCAPE_IMAGES.length);
      }, 20000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screensaverType]);

  useEffect(() => {
    if (screensaverType === "images") {
      loadNewImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageIndex, screensaverType]);

  const handleInteraction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    deactivateScreensaver();
  };

  const renderContent = () => {
    if (screensaverType === "video") {
      return (
        <video
          className={styles.video}
          src={VIDEO_URLS[currentVideoIndex]}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    } else if (screensaverType === "images") {
      return (
        <div 
          className={styles.imageContainer}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      );
    } else {
      return (
        <div className={styles.animationContainer}>
          <div className={styles.wave}></div>
          <div className={styles.wave}></div>
          <div className={styles.wave}></div>
        </div>
      );
    }
  };

  return (
    <div 
      className={styles.screensaver}
      onClick={handleInteraction}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {renderContent()}
      <div className={styles.clock}>
        {new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};

export default Screensaver;