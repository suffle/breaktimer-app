import React, { FC } from "react";
import { Switch, FormGroup } from "@blueprintjs/core";
import { ISystemSettings } from "../../../types/settings";
import { ChangeFieldInterface } from "app/types/functions";

interface Props {
  onChange: ChangeFieldInterface;
  settings: ISystemSettings;
}

const SystemSettings: FC<Props> = ({ onChange, settings }) => {
  return (
    <FormGroup>
      <Switch
        label="Start at login"
        checked={settings.autoLaunch}
        onChange={(e) => onChange("autoLaunch")(e.currentTarget.checked)}
      />
    </FormGroup>
  );
};

export default SystemSettings;
