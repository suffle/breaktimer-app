import { defaultSettings } from "./defaultSettings";
import Store from "electron-store";
import {
  IBreakSettings,
  ICustomizationSettings,
  IIdleResetSettings,
  Settings,
  SETTING_TYPES,
  ISystemSettings,
  IWorkingHoursSettings,
} from "../types/settings";
import { setAutoLauch } from "../main/lib/auto-launch";
import { initBreaks } from "../main/lib/breaks";

const store = new Store<{
  settings: Settings;
  appInitialized: boolean;
}>({
  defaults: {
    settings: defaultSettings,
    appInitialized: false,
  },
});

export function getSettings(): Settings;
export function getSettings(type: SETTING_TYPES.BREAK_SETTINGS): IBreakSettings;
export function getSettings(
  type: SETTING_TYPES.CUSTOMIZATION_SETTINGS
): ICustomizationSettings;
export function getSettings(
  type: SETTING_TYPES.WORKING_HOURS_SETTINGS
): IWorkingHoursSettings;
export function getSettings(
  type: SETTING_TYPES.IDLE_RESET_SETTINGS
): IIdleResetSettings;
export function getSettings(
  type: SETTING_TYPES.SYSTEM_SETTINGS
): ISystemSettings;
export function getSettings(type?: SETTING_TYPES) {
  if (type) {
    return store.get("settings")[type];
  }
  return store.get("settings") as Settings;
}

export function setSettings(settings: Settings, resetBreaks = true): void {
  const currentSystemSettings = getSettings(SETTING_TYPES.SYSTEM_SETTINGS);

  if (currentSystemSettings.autoLaunch !== settings.systemSettings.autoLaunch) {
    setAutoLauch(settings.systemSettings.autoLaunch);
  }

  store.set({ settings });

  if (resetBreaks) {
    initBreaks();
  }
}

export function getAppInitialized(): boolean {
  return store.get("appInitialized") as boolean;
}

export function setAppInitialized(): void {
  store.set({ appInitialized: true });
}

export function setBreaksEnabled(breaksEnabled: boolean): void {
  const { breakSettings, ...settings } = getSettings();
  setSettings(
    { ...settings, breakSettings: { ...breakSettings, breaksEnabled } },
    false
  );
}
