import path from "path";
import moment, { Moment } from "moment";
import { app, dialog, Menu, MenuItemConstructorOptions, Tray } from "electron";
import packageJson from "../../../package.json";
import { getSettings, setSettings } from "../../lib/store";
import { createSettingsWindow } from "./windows";
import {
  getBreakTime,
  checkInWorkingHours,
  checkIdle,
  startBreakNow,
  createBreak,
} from "./breaks";
import { SETTING_TYPES } from "../../types/settings";
import { createDnd, destroyDnd, getDndTime } from "./dnd";
import { MinutesLeft } from "../../types/tray";
import { DND_UNTIL } from "../../types/dnd";

let tray: Tray;
const lastMinsLeftObj: MinutesLeft = {
  break: 0,
  dnd: 0,
};

export function buildTray(): void {
  if (!tray) {
    let imgPath;
    if (process.platform === "darwin") {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/tray-IconTemplate.png"
          : path.join(
              process.resourcesPath,
              "app/resources/tray/tray-IconTemplate.png"
            );
    } else {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/icon.png"
          : path.join(process.resourcesPath, "app/resources/tray/icon.png");
    }
    tray = new Tray(imgPath);

    // On windows, context menu will not show on left click by default
    if (process.platform === "win32") {
      tray.on("click", () => {
        tray.popUpContextMenu();
      });
    }
  }

  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);
  const breaksEnabled = breakSettings?.breaksEnabled;

  const setBreaksEnabled = (breaksEnabled: boolean): void => {
    const { breakSettings, ...settings } = getSettings();
    setSettings({
      ...settings,
      breakSettings: { ...breakSettings, breaksEnabled },
    });
    buildTray();
  };

  const createAboutWindow = (): void => {
    dialog.showMessageBox({
      title: "About",
      type: "info",
      message: `BreakTimer`,
      detail: `Build: ${packageJson.version}\n\nWebsite:\nhttps://breaktimer.app\n\nSource Code:\nhttps://github.com/tom-james-watson/breaktimer-app\n\nDistributed under GLP-3.0-or-later license.`,
    });
  };

  const quit = (): void => {
    setTimeout(() => {
      app.exit(0);
    });
  };

  const breakTime = getBreakTime();
  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();
  const dndTime = getDndTime();
  const dndMinsLeft = dndTime?.diff(moment(), "minutes");
  const breakMinsLeft = breakTime?.diff(moment(), "minutes");

  let nextBreak = "";
  let dndFor = "";

  if (breakMinsLeft !== undefined) {
    if (breakMinsLeft > 1) {
      nextBreak = `Next break in ${breakMinsLeft} minutes`;
    } else if (breakMinsLeft === 1) {
      nextBreak = `Next break in 1 minute`;
    } else {
      nextBreak = `Next break in less than a minute`;
    }
  }

  if (dndMinsLeft !== undefined && dndMinsLeft > 0) {
    const hoursLeft = Math.floor(dndMinsLeft / 60);
    const hourString =
      hoursLeft > 1 ? `${hoursLeft} hours` : `${hoursLeft} hours,`;
    const minsLeft = dndMinsLeft % 60;
    const minString =
      minsLeft > 1 ? `${minsLeft} minutes` : `${minsLeft} minute`;
    dndFor = `Disabled for ${hoursLeft > 0 ? hourString : ""} ${minString}`;
  } else {
    dndFor = "";
  }

  const isDnd = dndMinsLeft !== undefined && dndMinsLeft > 0;

  const menuItems: MenuItemConstructorOptions[] = [
    {
      label: nextBreak,
      visible: breakTime !== null && inWorkingHours,
      enabled: false,
    },
    {
      label: `Outside of working hours`,
      visible: !inWorkingHours,
      enabled: false,
    },
    {
      label: dndFor,
      visible: isDnd,
      enabled: false,
    },
    {
      label: `Idle`,
      visible: idle,
      enabled: false,
    },
    { type: "separator" },
    {
      label: breaksEnabled ? "Disable" : "Enable",
      click: setBreaksEnabled.bind(null, !breaksEnabled),
    },
    {
      label: "Start break now",
      visible: breakTime !== null && inWorkingHours,
      click: startBreakNow,
    },
    {
      label: "Restart break period",
      visible: breakTime !== null && inWorkingHours,
      click: createBreak.bind(null, false),
    },
    {
      label: "Do not disturb",
      visible: breaksEnabled,
      submenu: Menu.buildFromTemplate([
        {
          label: "Reactivate",
          visible: isDnd,
          click: destroyDnd,
        },
        {
          label: "For 1 Hour",
          visible: true,
          click: createDnd.bind(null, 60),
        },
        {
          label: "For 2 Hours",
          visible: true,
          click: createDnd.bind(null, 120),
        },
        {
          label: "Until tomorrow",
          visible: true,
          click: createDnd.bind(null, DND_UNTIL.TOMORROW),
        },
      ]),
    },
    { type: "separator" },
    { label: "Settings...", click: createSettingsWindow },
    { label: "About...", click: createAboutWindow },
    { label: "Quit", click: quit },
  ];

  const contextMenu = Menu.buildFromTemplate(menuItems);

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu);
}

function checkIfMinsChanged(
  name: keyof MinutesLeft,
  current: Moment | null
): boolean {
  if (current === null) {
    return false;
  }
  const currentMinsLeft = current.diff(moment(), "seconds");
  const lastMinsLeft = lastMinsLeftObj[name];

  if (currentMinsLeft !== lastMinsLeft) {
    lastMinsLeftObj[name] = currentMinsLeft;
    return true;
  }

  return false;
}

export function initTray(): void {
  buildTray();
  setInterval(() => {
    const breakChanged = checkIfMinsChanged("break", getDndTime());
    const disabledChanged = checkIfMinsChanged("dnd", getDndTime());

    if (breakChanged || disabledChanged) {
      buildTray();
    }
  }, 5000);
}
