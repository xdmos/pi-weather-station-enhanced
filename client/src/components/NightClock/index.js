import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { format } from "date-fns";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";

const MOVE_INTERVAL_MS = 25000;

/**
 * Clamp a number within [min, max].
 *
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Pick a random on-screen position for the clock so it moves around
 * (burn-in prevention).
 *
 * @param {Object} args
 * @param {number} args.vw viewport width
 * @param {number} args.vh viewport height
 * @param {number} args.ew element width
 * @param {number} args.eh element height
 * @returns {{x: number, y: number}}
 */
const pickPosition = ({ vw, vh, ew, eh }) => {
  const maxX = Math.max(0, vw - ew);
  const maxY = Math.max(0, vh - eh);

  // Keep away from the very edges so it looks intentional.
  const padX = clamp(Math.round(vw * 0.05), 20, 80);
  const padY = clamp(Math.round(vh * 0.05), 20, 80);

  const x = Math.floor(padX + Math.random() * Math.max(1, maxX - padX * 2));
  const y = Math.floor(padY + Math.random() * Math.max(1, maxY - padY * 2));

  return { x, y };
};

/**
 * Full-screen dim moving clock for night mode.
 *
 * @returns {JSX.Element}
 */
const NightClock = () => {
  const { clockTime, mouseHide } = useContext(AppContext);
  const is12h = clockTime === "12";

  const [now, setNow] = useState(() => Date.now());
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const clockRef = useRef(null);

  // Use one formatter string to avoid branching in JSX.
  const timeFmt = useMemo(() => (is12h ? "p" : "HH:mm"), [is12h]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const move = () => {
      const el = clockRef.current;
      const rect = el ? el.getBoundingClientRect() : { width: 0, height: 0 };

      setPos(
        pickPosition({
          vw: window.innerWidth,
          vh: window.innerHeight,
          ew: rect.width,
          eh: rect.height,
        })
      );
    };

    // Initial placement after first paint.
    const raf = requestAnimationFrame(move);

    const interval = setInterval(move, MOVE_INTERVAL_MS);
    window.addEventListener("resize", move);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      window.removeEventListener("resize", move);
    };
  }, []);

  return (
    <div className={`${styles.nightRoot} ${mouseHide ? styles.hideMouse : ""}`}>
      <div
        ref={clockRef}
        className={styles.clock}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        aria-label="Night clock"
      >
        {format(now, timeFmt)}
      </div>
    </div>
  );
};

export default NightClock;
