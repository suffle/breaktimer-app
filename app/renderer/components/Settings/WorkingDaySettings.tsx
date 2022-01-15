import React, { FC } from "react";
import { Switch, FormGroup } from "@blueprintjs/core";
import {
  IWorkingHours,
  IWorkingHoursDaySettings,
} from "../../../types/settings";
import { ChangeValueInterface } from "app/types/functions";
import TimePeriodPicker from "../TimePeriodPicker";

interface WorkingDaySettingsProps {
  onChange(daySettings: IWorkingHoursDaySettings): void;
  settings: IWorkingHoursDaySettings;
  defaultWorkingHours: IWorkingHours[];
  disabled: boolean;
}

const WorkingDaySettings: FC<WorkingDaySettingsProps> = ({
  onChange,
  settings,
  disabled,
  defaultWorkingHours,
}) => {
  const changeSettings =
    (fieldName: keyof IWorkingHoursDaySettings): ChangeValueInterface =>
    (value) => {
      if (fieldName === "customTimes" && settings.workingHours.length === 0) {
        console.log(settings.workingHours.length);
        onChange({
          ...settings,
          [fieldName]: value as boolean,
          workingHours: [...defaultWorkingHours],
        });
        return;
      }
      onChange({
        ...settings,
        [fieldName]: value,
      });
    };

  return (
    <FormGroup label={settings.label}>
      <Switch
        label="Active"
        checked={settings.active}
        onChange={(e) => changeSettings("active")(e.currentTarget.checked)}
        disabled={disabled}
      />
      <Switch
        label="Custom Work Hours"
        checked={settings.customTimes}
        onChange={(e) => changeSettings("customTimes")(e.currentTarget.checked)}
        disabled={disabled}
      />
      {settings.customTimes && (
        <TimePeriodPicker
          onChange={changeSettings("workingHours")}
          timePeriods={settings.workingHours}
          disabled={disabled}
        />
      )}
    </FormGroup>
  );
};

export default WorkingDaySettings;
