import React, { FC } from "react";
import { Switch, FormGroup } from "@blueprintjs/core";
import {
  IWorkingHoursDaySettings,
  IWorkingHoursSettings,
} from "../../../types/settings";
import { ChangeFieldInterface } from "app/types/functions";
import TimePeriodPicker from "../TimePeriodPicker";
import WorkingDaySettings from "./WorkingDaySettings";

interface WorkingHoursSettingsProps {
  onChange: ChangeFieldInterface;
  settings: IWorkingHoursSettings;
  isBreaksEnabled: boolean;
}

const WorkingHoursSettings: FC<WorkingHoursSettingsProps> = ({
  onChange,
  settings,
  isBreaksEnabled,
}) => {
  const handleChangeDaySettings =
    (index: number) =>
    (daySettings: IWorkingHoursDaySettings): void => {
      const currentDaySettings = settings.workingDays[index];
      const newDaySettings = { ...currentDaySettings, ...daySettings };

      onChange("workingDays")(
        Object.assign([], settings.workingDays, {
          [index]: newDaySettings,
        })
      );
    };
  return (
    <>
      <FormGroup>
        <Switch
          label="Enable working hours"
          checked={settings.workingHoursEnabled}
          onChange={(e) =>
            onChange("workingHoursEnabled")(e.currentTarget.checked)
          }
          disabled={!isBreaksEnabled}
        />
      </FormGroup>
      <TimePeriodPicker
        disabled={!isBreaksEnabled || !settings.workingHoursEnabled}
        onChange={onChange("workingHours")}
        timePeriods={settings.workingHours}
      />
      <FormGroup label="Breaks on">
        {settings.workingDays.map((day, index) => (
          <WorkingDaySettings
            onChange={handleChangeDaySettings(index)}
            key={day.label}
            settings={day}
            defaultWorkingHours={settings.workingHours}
            disabled={!isBreaksEnabled || !settings.workingHoursEnabled}
          />
        ))}
      </FormGroup>
    </>
  );
};

export default WorkingHoursSettings;
