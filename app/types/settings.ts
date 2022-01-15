export enum NotificationType {
  Notification = "NOTIFICATION",
  Popup = "POPUP",
}

export enum SETTING_TYPES {
  BREAK_SETTINGS = "breakSettings",
  CUSTOMIZATION_SETTINGS = "customizationSettings",
  WORKING_HOURS_SETTINGS = "workingHoursSettings",
  IDLE_RESET_SETTINGS = "idleResetSettings",
  SYSTEM_SETTINGS = "systemSettings",
}

export interface IWorkingHours {
  from: Date;
  to: Date;
}

export interface IWorkingHoursDaySettings {
  label: string;
  active: boolean;
  customTimes: boolean;
  workingHours: IWorkingHours[];
}

export type IWorkingHoursDays = [
  IWorkingHoursDaySettings,
  IWorkingHoursDaySettings,
  IWorkingHoursDaySettings,
  IWorkingHoursDaySettings,
  IWorkingHoursDaySettings,
  IWorkingHoursDaySettings,
  IWorkingHoursDaySettings
];

export interface IBreakSettings {
  notificationType: NotificationType;
  breaksEnabled: boolean;
  breakFrequency: Date;
  breakLength: Date;
  skipBreakEnabled: boolean;
  postponeBreakEnabled: boolean;
  postponeLength: Date;
  postponeLimit: number;
  endBreakEnabled: boolean;
  gongEnabled: boolean;
}

export interface IColorSettings {
  backgroundColor: string;
  textColor: string;
  backdropColor: string;
  backdropOpacity: number;
}

export interface ICustomizationSettings extends IColorSettings {
  breakTitle: string;
  breakMessage: string;
  showBackdrop: boolean;
}

export interface IWorkingHoursSettings {
  workingHoursEnabled: boolean;
  workingHours: IWorkingHours[];
  workingDays: IWorkingHoursDays;
}

export interface IIdleResetSettings {
  idleResetEnabled: boolean;
  idleResetLength: Date;
  idleResetNotification: boolean;
}

export interface ISystemSettings {
  autoLaunch: boolean;
}

export interface Settings {
  breakSettings: IBreakSettings;
  customizationSettings: ICustomizationSettings;
  workingHoursSettings: IWorkingHoursSettings;
  idleResetSettings: IIdleResetSettings;
  systemSettings: ISystemSettings;
}
