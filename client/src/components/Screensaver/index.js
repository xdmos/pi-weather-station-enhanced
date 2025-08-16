import React, { useState, useEffect, useContext } from "react";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";

const LANDSCAPE_IMAGES = [
  "https://picsum.photos/1920/1080?random=1",
  "https://picsum.photos/1920/1080?random=2", 
  "https://picsum.photos/1920/1080?random=3",
  "https://picsum.photos/1920/1080?random=4",
  "https://picsum.photos/1920/1080?random=5",
  "https://picsum.photos/1920/1080?random=6",
  "https://picsum.photos/1920/1080?random=7",
  "https://picsum.photos/1920/1080?random=8",
  "https://picsum.photos/1920/1080?random=9",
  "https://picsum.photos/1920/1080?random=10"
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
  const { screensaverType, deactivateScreensaver, screensaverDuration } = useContext(AppContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(screensaverDuration * 60);
  const [imageLoaded, setImageLoaded] = useState(false);

  const loadNewImage = () => {
    setImageLoaded(false);
    const baseUrl = LANDSCAPE_IMAGES[currentImageIndex];
    const timestamp = new Date().getTime();
    setImageUrl(`${baseUrl}&t=${timestamp}`);
  };

  // Countdown timer effect
  useEffect(() => {
    setTimeRemaining(screensaverDuration * 60);
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          deactivateScreensaver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screensaverDuration, deactivateScreensaver]);

  // Image rotation effect
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

  // Load new image when index changes
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <>
          <div 
            className={`${styles.imageContainer} ${imageLoaded ? styles.loaded : ''}`}
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <img
            src={imageUrl}
            alt="Loading..."
            className={styles.hiddenImg}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.log("Image failed to load, trying next...");
              setCurrentImageIndex((prev) => (prev + 1) % LANDSCAPE_IMAGES.length);
            }}
          />
          {!imageLoaded && (
            <div className={styles.loadingIndicator}>
              Loading image...
            </div>
          )}
        </>
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
          minute: '2-digit',
          hour12: false
        })}
      </div>
      <div className={styles.countdown}>
        <div className={styles.countdownLabel}>Screensaver ends in:</div>
        <div className={styles.countdownTime}>{formatTime(timeRemaining)}</div>
      </div>
    </div>
  );
};

export default Screensaver;