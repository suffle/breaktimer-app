import React, { FC } from "react";
import { Switch, HTMLSelect, FormGroup } from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import { IBreakSettings, NotificationType } from "../../../types/settings";
import { ChangeFieldInterface } from "app/types/functions";

interface BreakSettingsProps {
  onChange: ChangeFieldInterface;
  settings: IBreakSettings;
}

const BreakSettings: FC<BreakSettingsProps> = ({ onChange, settings }) => {
  return (
    <>
      <FormGroup label="Notify me with">
        <HTMLSelect
          value={settings.notificationType}
          options={[
            {
              value: NotificationType.Popup,
              label: "Popup break",
            },
            {
              value: NotificationType.Notification,
              label: "Simple notification",
            },
          ]}
          onChange={(e) =>
            onChange("notificationType")(e.target.value as NotificationType)
          }
          disabled={!settings.breaksEnabled}
        />
      </FormGroup>
      <FormGroup label="Break frequency" labelInfo="(hh:mm:ss)">
        <TimePicker
          onChange={onChange("breakFrequency")}
          value={new Date(settings.breakFrequency)}
          selectAllOnFocus
          precision={TimePrecision.SECOND}
          disabled={!settings.breaksEnabled}
        />
      </FormGroup>
      <FormGroup label="Break length" labelInfo="(hh:mm:ss)">
        <TimePicker
          onChange={onChange("breakLength")}
          value={new Date(settings.breakLength)}
          selectAllOnFocus
          precision={TimePrecision.SECOND}
          disabled={
            !settings.breaksEnabled ||
            settings.notificationType !== NotificationType.Popup
          }
        />
      </FormGroup>
      <Switch
        label="Allow skip break"
        checked={settings.skipBreakEnabled}
        onChange={(e) => onChange("skipBreakEnabled")(e.currentTarget.checked)}
        disabled={!settings.breaksEnabled}
      />
      <Switch
        label="Allow snooze break"
        checked={settings.postponeBreakEnabled}
        onChange={(e) => onChange("skipBreakEnabled")(e.currentTarget.checked)}
        disabled={!settings.breaksEnabled}
      />
      <FormGroup label="Snooze length" labelInfo="(hh:mm:ss)">
        <TimePicker
          onChange={onChange("postponeLength")}
          value={new Date(settings.postponeLength)}
          selectAllOnFocus
          precision={TimePrecision.SECOND}
          disabled={!settings.breaksEnabled || !settings.postponeBreakEnabled}
        />
      </FormGroup>
      <FormGroup label="Snooze limit">
        <HTMLSelect
          value={settings.postponeLimit}
          options={[
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 0, label: "No limit" },
          ]}
          onChange={(e) => onChange("postponeLimit")(Number(e.target.value))}
          disabled={!settings.breaksEnabled || !settings.postponeBreakEnabled}
        />
      </FormGroup>
      <Switch
        label="Play gong sound on break start/end"
        checked={settings.gongEnabled}
        onChange={(e) => onChange("gongEnabled")(e.currentTarget.checked)}
        disabled={!settings.breaksEnabled}
      />
      <Switch
        label="Allow end break"
        checked={settings.endBreakEnabled}
        onChange={(e) => onChange("endBreakEnabled")(e.currentTarget.checked)}
        disabled={!settings.breaksEnabled}
      />
    </>
  );
};

export default BreakSettings;
