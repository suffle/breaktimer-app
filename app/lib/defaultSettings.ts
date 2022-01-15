import { IColorSettings, NotificationType, Settings } from "../types/settings";

export const defaultColors: IColorSettings = {
  textColor: "#ffffff",
  backgroundColor: "#16a085",
  backdropColor: "#001914",
  backdropOpacity: 0.7,
};
export const defaultSettings: Settings = {
  breakSettings: {
    breaksEnabled: true,
    notificationType: NotificationType.Popup,
    breakFrequency: new Date(0, 0, 0, 0, 28),
    breakLength: new Date(0, 0, 0, 0, 2),
    postponeLength: new Date(0, 0, 0, 0, 3),
    postponeLimit: 0,
    skipBreakEnabled: false,
    postponeBreakEnabled: true,
    endBreakEnabled: true,
    gongEnabled: true,
  },
  customizationSettings: {
    ...defaultColors,
    breakTitle: "Time for a break!",
    breakMessage: "Rest your eyes. Stretch your legs. Breathe. Relax.",
    showBackdrop: false,
  },
  workingHoursSettings: {
    workingHoursEnabled: true,
    workingHours: [{ from: new Date(0, 0, 0, 9), to: new Date(0, 0, 0, 18) }],
    workingDays: [
      {
        label: "Monday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
      {
        label: "Tuesday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
      {
        label: "Wednesday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
      {
        label: "Thursday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
      {
        label: "Friday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
      {
        label: "Saturday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
      {
        label: "Sunday",
        active: true,
        customTimes: false,
        workingHours: [],
      },
    ],
  },
  idleResetSettings: {
    idleResetEnabled: true,
    idleResetLength: new Date(0, 0, 0, 0, 5),
    idleResetNotification: false,
  },
  systemSettings: {
    autoLaunch: true,
  },
};
