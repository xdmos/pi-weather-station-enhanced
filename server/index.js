const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const os = require("os");
const cors = require("cors");
const open = require("open");
const ver = require("../package.json").version;
const appName = require("../package.json").name;
const { exec, execFile } = require("child_process");

const settingsCtrl = require("./settingsCtrl");
const geolocationCtrl = require("./geolocationCtrl");

const {
  getSettings,
  setSetting,
  deleteSetting,
  createSettingsFile,
  replaceSettings,
} = settingsCtrl;
const { getCoords } = geolocationCtrl;

const DIST_DIR = "/../client/dist";
const PORT = 8080;
const app = express();

// ***** dev only:
// const livereload = require("livereload");
// const connectLivereload = require("connect-livereload");
// const liveReloadServer = livereload.createServer();
// liveReloadServer.watch(path.join(`${__dirname}/${DIST_DIR}`));
// liveReloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     liveReloadServer.refresh("/");
//   }, 100);
// });
// app.use(connectLivereload());
// *****

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(`${__dirname}/${DIST_DIR}`)));
app.listen(PORT, "localhost", () => {
  console.log(`${appName} v${ver} has started on port ${PORT}`);
});

app.get("/settings", getSettings);
app.post("/settings", createSettingsFile);
app.put("/settings", replaceSettings);
app.patch("/setting", setSetting);
app.delete("/setting", deleteSetting);

app.get("/geolocation", getCoords);

// System info endpoint


const buildXEnv = () => ({
  ...process.env,
  DISPLAY: process.env.DISPLAY || ":0",
  XAUTHORITY: process.env.XAUTHORITY || path.join(os.homedir(), ".Xauthority"),
});

const runXdotool = (args, cb) => {
  execFile("xdotool", args, { env: buildXEnv() }, cb);
};

app.post("/window/minimize", (req, res) => {
  // In kiosk mode this is Chromium; xdotool needs DISPLAY/XAUTHORITY.
  runXdotool(["getactivewindow", "windowminimize"], (err) => {
    if (!err) {
      return res.json({ ok: true }).end();
    }

    // Fallback: minimize any visible Chromium windows.
    runXdotool(
      ["search", "--onlyvisible", "--class", "chromium", "windowminimize", "%@"],
      (err2) => {
        if (!err2) {
          return res.json({ ok: true }).end();
        }
        return res
          .status(500)
          .json({ ok: false, error: "Failed to minimize window" })
          .end();
      }
    );
  });
});

app.get("/system-info", (req, res) => {
  const getCpuTemp = () => {
    return new Promise((resolve) => {
      exec("cat /sys/class/thermal/thermal_zone0/temp", (error, stdout) => {
        if (error) {
          resolve(null);
        } else {
          const temp = parseInt(stdout) / 1000;
          resolve(temp);
        }
      });
    });
  };

  const getFanSpeed = () => {
    return new Promise((resolve) => {
      // Try to get fan speed from GPIO fan control
      exec("cat /sys/class/hwmon/hwmon*/fan1_input 2>/dev/null", (error, stdout) => {
        if (error || !stdout) {
          // If no hardware fan sensor, try to get PWM fan speed
          exec("cat /sys/class/thermal/cooling_device*/cur_state 2>/dev/null | head -1", (error2, stdout2) => {
            if (error2 || !stdout2) {
              resolve(null);
            } else {
              const state = parseInt(stdout2);
              // Convert state to percentage (assuming 0-4 states)
              const percentage = (state / 4) * 100;
              resolve(percentage);
            }
          });
        } else {
          const rpm = parseInt(stdout);
          resolve(rpm);
        }
      });
    });
  };

  const getDiskSpace = () => {
    return new Promise((resolve) => {
      exec("df -h / | awk 'NR==2 {print $4}'", (error, stdout) => {
        if (error) {
          resolve(null);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  };

  Promise.all([getCpuTemp(), getFanSpeed(), getDiskSpace()]).then(([cpuTemp, fanSpeed, diskSpace]) => {
    res.json({
      cpuTemp,
      fanSpeed,
      diskSpace
    });
  });
});
