import moment, { Moment } from "moment";
import { PowerMonitor } from "electron";
import {
  IWorkingHoursDays,
  IWorkingHoursDaySettings,
  NotificationType,
  SETTING_TYPES,
} from "../../types/settings";
import { BreakTime } from "../../types/breaks";
import { IpcChannel } from "../../types/ipc";
import { sendIpc } from "./ipc";
import { getSettings } from "../../lib/store";
import { buildTray } from "./tray";
import { showNotification } from "./notifications";
import { createBreakWindows } from "./windows";
import { checkDnd } from "./dnd";

let powerMonitor: PowerMonitor;
let breakTime: BreakTime = null;
let havingBreak = false;
let postponedCount = 0;
let idleStart: Date | null = null;
let lockStart: Date | null = null;
let lastTick: Date | null = null;

export function getBreakTime(): BreakTime {
  return breakTime;
}

export function getBreakLength(): Date {
  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);
  return breakSettings?.breakLength;
}

function zeroPad(n: number) {
  const nStr = String(n);
  return nStr.length === 1 ? `0${nStr}` : nStr;
}

function getSeconds(date: Date): number {
  return (
    date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds() || 1
  ); // can't be 0
}

function getIdleResetSeconds(): number {
  const idleResetSettings = getSettings(SETTING_TYPES.IDLE_RESET_SETTINGS);
  return getSeconds(new Date(idleResetSettings?.idleResetLength));
}

function getBreakSeconds(): number {
  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);
  return getSeconds(new Date(breakSettings?.breakFrequency));
}

function createIdleNotification() {
  const idleResetSettings = getSettings(SETTING_TYPES.IDLE_RESET_SETTINGS);

  if (!idleResetSettings?.idleResetEnabled || idleStart === null) {
    return;
  }

  let idleSeconds = Number(((+new Date() - +idleStart) / 1000).toFixed(0));
  let idleMinutes = 0;
  let idleHours = 0;

  if (idleSeconds > 60) {
    idleMinutes = Math.floor(idleSeconds / 60);
    idleSeconds -= idleMinutes * 60;
  }

  if (idleMinutes > 60) {
    idleHours = Math.floor(idleMinutes / 60);
    idleMinutes -= idleHours * 60;
  }

  if (idleResetSettings?.idleResetNotification) {
    showNotification(
      "Break countdown reset",
      `Idle for ${zeroPad(idleHours)}:${zeroPad(idleMinutes)}:${zeroPad(
        idleSeconds
      )}`
    );
  }
}

export function createBreak(isPostpone = false): void {
  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);

  if (idleStart) {
    createIdleNotification();
    idleStart = null;
    postponedCount = 0;
  }

  const freq = new Date(
    isPostpone ? breakSettings?.postponeLength : breakSettings?.breakFrequency
  );

  breakTime = moment()
    .add(freq.getHours(), "hours")
    .add(freq.getMinutes(), "minutes")
    .add(freq.getSeconds(), "seconds");

  buildTray();
}

export function endPopupBreak(): void {
  if (breakTime !== null && breakTime < moment()) {
    breakTime = null;
    havingBreak = false;
    postponedCount = 0;
  }
}

export function getAllowPostpone(): boolean {
  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);
  return (
    !breakSettings?.postponeLimit ||
    postponedCount < breakSettings?.postponeLimit
  );
}

export function postponeBreak(): void {
  postponedCount++;
  havingBreak = false;
  createBreak(true);
}

function doBreak(): void {
  havingBreak = true;

  const { breakSettings, customizationSettings } = getSettings();

  if (breakSettings?.notificationType === NotificationType.Notification) {
    showNotification(
      customizationSettings?.breakTitle,
      customizationSettings?.breakMessage
    );
    if (breakSettings?.gongEnabled) {
      sendIpc(IpcChannel.GongStartPlay);
    }
    havingBreak = false;
    createBreak();
  }

  if (breakSettings?.notificationType === NotificationType.Popup) {
    createBreakWindows();
  }
}

export function checkInWorkingHours(): boolean {
  const workingHoursSettings = getSettings(
    SETTING_TYPES.WORKING_HOURS_SETTINGS
  );

  if (!workingHoursSettings?.workingHoursEnabled) {
    return true;
  }

  const now = moment();

  const days: IWorkingHoursDays = workingHoursSettings?.workingDays;
  const currentDayOfWeek = now.day() === 0 ? 6 : now.day() - 1;
  const currentDay = days[
    currentDayOfWeek as keyof IWorkingHoursDays
  ] as IWorkingHoursDaySettings;

  if (!currentDay.active) {
    return false;
  }

  const workingHours = currentDay.customTimes
    ? currentDay.workingHours
    : workingHoursSettings.workingHours;

  const inWorkHours = workingHours.some((hours) => {
    let hoursFrom: Date | Moment = new Date(hours.from);
    let hoursTo: Date | Moment = new Date(hours.to);
    hoursFrom = moment()
      .set("hours", hoursFrom.getHours())
      .set("minutes", hoursFrom.getMinutes())
      .set("seconds", 0);
    hoursTo = moment()
      .set("hours", hoursTo.getHours())
      .set("minutes", hoursTo.getMinutes())
      .set("seconds", 0);

    if (now < hoursFrom) {
      return false;
    }

    if (now > hoursTo) {
      return false;
    }

    return true;
  });

  return inWorkHours;
}

enum IdleState {
  Active = "active",
  Idle = "idle",
  Locked = "locked",
  Unknown = "unknown",
}

export function checkIdle(): boolean {
  const idleResetSettings = getSettings(SETTING_TYPES.IDLE_RESET_SETTINGS);

  const state: IdleState = powerMonitor.getSystemIdleState(
    getIdleResetSeconds()
  ) as IdleState;

  if (state === IdleState.Locked) {
    if (!lockStart) {
      lockStart = new Date();
      return false;
    } else {
      const lockSeconds = Number(
        ((+new Date() - +lockStart) / 1000).toFixed(0)
      );
      return lockSeconds > getIdleResetSeconds();
    }
  }

  lockStart = null;

  if (!idleResetSettings?.idleResetEnabled) {
    return false;
  }

  return state === IdleState.Idle;
}

function checkShouldHaveBreak(): boolean {
  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);
  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();
  const isDnd = checkDnd();

  return (
    !havingBreak &&
    breakSettings?.breaksEnabled &&
    inWorkingHours &&
    !idle &&
    !isDnd
  );
}

function checkBreak(): void {
  const now = moment();

  if (breakTime !== null && now > breakTime) {
    doBreak();
  }
}

export function startBreakNow(): void {
  breakTime = moment();
}

function tick(): void {
  try {
    const shouldHaveBreak = checkShouldHaveBreak();

    // This can happen if the computer is put to sleep. In this case, we want
    // to skip the break if the time the computer was unresponsive was greater
    // than the idle reset.
    const secondsSinceLastTick = lastTick
      ? Math.abs(+new Date() - +lastTick) / 1000
      : 0;
    const breakSeconds = getBreakSeconds();
    const lockSeconds = lockStart && Math.abs(+new Date() - +lockStart) / 1000;

    if (lockStart && lockSeconds !== null && lockSeconds > breakSeconds) {
      // The computer has been locked for longer than the break period. In this
      // case, it's not particularly helpful to show an idle reset
      // notification, so unset idle start
      idleStart = null;
      lockStart = null;
    } else if (secondsSinceLastTick > breakSeconds) {
      // The computer has been slept for longer than the break period. In this
      // case, it's not particularly helpful to show an idle reset
      // notification, so just reset the break
      lockStart = null;
      breakTime = null;
    } else if (secondsSinceLastTick > getIdleResetSeconds()) {
      //  If idleStart exists, it means we were idle before the computer slept.
      //  If it doesn't exist, count the computer going unresponsive as the
      //  start of the idle period.
      if (!idleStart) {
        lockStart = null;
        idleStart = lastTick;
      }
      createBreak();
    }

    if (!shouldHaveBreak && !havingBreak && breakTime) {
      if (checkIdle()) {
        idleStart = new Date();
      }
      breakTime = null;
      buildTray();
      return;
    }

    if (shouldHaveBreak && !breakTime) {
      createBreak();
      return;
    }

    if (shouldHaveBreak) {
      checkBreak();
    }
  } finally {
    lastTick = new Date();
  }
}

let tickInterval: NodeJS.Timeout;

export function initBreaks(): void {
  powerMonitor = require("electron").powerMonitor;

  const breakSettings = getSettings(SETTING_TYPES.BREAK_SETTINGS);

  if (breakSettings?.breaksEnabled) {
    createBreak();
  }

  if (tickInterval) {
    clearInterval(tickInterval);
  }

  tickInterval = setInterval(tick, 1000);
}
