import React, { FC } from "react";
import { Switch, FormGroup } from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import { IIdleResetSettings } from "../../../types/settings";
import { ChangeFieldInterface } from "app/types/functions";

interface IdleResetSettingsProps {
  onChange: ChangeFieldInterface;
  settings: IIdleResetSettings;
  isBreaksEnabled: boolean;
}

const IdleResetSettings: FC<IdleResetSettingsProps> = ({
  onChange,
  settings,
  isBreaksEnabled,
}) => {
  return (
    <React.Fragment>
      <FormGroup>
        <Switch
          label="Enable idle reset"
          checked={settings.idleResetEnabled}
          onChange={(e) =>
            onChange("idleResetEnabled")(e.currentTarget.checked)
          }
          disabled={!isBreaksEnabled}
        />
      </FormGroup>
      <FormGroup
        label="Reset break countdown when idle for"
        labelInfo="(hh:mm:ss)"
      >
        <TimePicker
          onChange={onChange("idleResetLength")}
          value={new Date(settings.idleResetLength)}
          selectAllOnFocus
          precision={TimePrecision.SECOND}
          disabled={!isBreaksEnabled || !settings.idleResetEnabled}
        />
      </FormGroup>
      <Switch
        label="Show notification on idle reset"
        checked={settings.idleResetNotification}
        onChange={(e) =>
          onChange("idleResetNotification")(e.currentTarget.checked)
        }
        disabled={!isBreaksEnabled || !settings.idleResetEnabled}
      />
    </React.Fragment>
  );
};

export default IdleResetSettings;
