import {
  IBreakSettings,
  ICustomizationSettings,
  IIdleResetSettings,
  ISystemSettings,
  IWorkingHours,
  IWorkingHoursDaySettings,
  IWorkingHoursSettings,
  SETTING_TYPES,
} from "./settings";

export type ChangeValueInterface = (
  value:
    | number
    | string
    | boolean
    | Date
    | IWorkingHours[]
    | IWorkingHoursDaySettings[]
) => void;

export type ChangePeriodInterface = (value: IWorkingHours) => void;

export type ChangeFieldInterface = (
  fieldName:
    | keyof IBreakSettings
    | keyof ICustomizationSettings
    | keyof IWorkingHoursSettings
    | keyof IIdleResetSettings
    | keyof ISystemSettings
) => ChangeValueInterface;

export type ChangeSettingsInterface = (
  settingsType: SETTING_TYPES
) => ChangeFieldInterface;
