import React, { FC } from "react";
import {
  Switch,
  FormGroup,
  InputGroup,
  Button,
  Slider,
} from "@blueprintjs/core";
import { ICustomizationSettings } from "../../../types/settings";
import { ChangeFieldInterface } from "app/types/functions";

import styles from "./index.scss";

interface CustomizationSettingsProps {
  onResetColors(): void;
  onChange: ChangeFieldInterface;
  settings: ICustomizationSettings;
  isBreaksEnabled: boolean;
  disableBackdropChange: boolean;
}

const CustomizationSettings: FC<CustomizationSettingsProps> = ({
  onChange,
  onResetColors,
  settings,
  isBreaksEnabled,
  disableBackdropChange,
}) => {
  return (
    <>
      <FormGroup label="Break title">
        <InputGroup
          id="break-title"
          value={settings.breakTitle}
          onChange={(e) => onChange("breakTitle")(e.target.value)}
          disabled={!isBreaksEnabled}
        />
      </FormGroup>
      <FormGroup label="Break message">
        <InputGroup
          id="break-message"
          value={settings.breakMessage}
          onChange={(e) => onChange("breakMessage")(e.target.value)}
          disabled={!isBreaksEnabled}
        />
      </FormGroup>
      <FormGroup label="Primary color">
        <InputGroup
          className={styles.colorPicker}
          type="color"
          value={settings.backgroundColor}
          onChange={(e) => onChange("backgroundColor")(e.target.value)}
          disabled={!isBreaksEnabled}
        />
      </FormGroup>
      <FormGroup label="Text color">
        <InputGroup
          className={styles.colorPicker}
          type="color"
          value={settings.textColor}
          onChange={(e) => onChange("textColor")(e.target.value)}
          disabled={!isBreaksEnabled}
        />
      </FormGroup>
      <FormGroup>
        <Switch
          label="Show backdrop"
          checked={settings.showBackdrop}
          onChange={(e) => onChange("showBackdrop")(e.currentTarget.checked)}
          disabled={!isBreaksEnabled || !disableBackdropChange}
        />
      </FormGroup>
      <FormGroup label="Backdrop color">
        <InputGroup
          className={styles.colorPicker}
          type="color"
          value={settings.backdropColor}
          onChange={(e) => onChange("backdropColor")(e.target.value)}
          disabled={!settings.showBackdrop}
        />
      </FormGroup>
      <FormGroup label="Backdrop opacity">
        <Slider
          min={0.2}
          max={1}
          stepSize={0.05}
          labelPrecision={2}
          labelStepSize={0.2}
          onChange={onChange("backdropOpacity")}
          value={settings.backdropOpacity}
          disabled={!settings.showBackdrop}
        />
      </FormGroup>
      <FormGroup>
        <Button onClick={onResetColors}>Reset colors</Button>
      </FormGroup>
    </>
  );
};

export default CustomizationSettings;
