import React, { FC } from "react";
import { Button, FormGroup, Icon } from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import { IWorkingHours } from "../../../types/settings";
import { ChangePeriodInterface } from "app/types/functions";

interface SinglePeriodPickerProps {
  onChange: ChangePeriodInterface;
  timePeriod: IWorkingHours;
  disabled: boolean;
  onRemove?(): void;
}

const SinglePeriodPicker: FC<SinglePeriodPickerProps> = ({
  onChange,
  timePeriod,
  disabled,
  onRemove,
}) => {
  const handlePeriodChange = (key: keyof IWorkingHours) => (newTime: Date) => {
    const newTimePeriod = { ...timePeriod, [key]: newTime };
    onChange(newTimePeriod);
  };
  return (
    <FormGroup>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: "10px" }}>From:</span>
        <TimePicker
          onChange={handlePeriodChange("from")}
          value={new Date(timePeriod.from)}
          selectAllOnFocus
          disabled={disabled}
        />
        <span style={{ marginRight: "10px", marginLeft: "20px" }}>To:</span>
        <TimePicker
          onChange={handlePeriodChange("to")}
          value={new Date(timePeriod.to)}
          selectAllOnFocus
          disabled={disabled}
        />
        {onRemove && (
          <span style={{ marginLeft: "20px" }}>
            <Button onClick={onRemove} outlined>
              <Icon icon="remove" />
            </Button>
          </span>
        )}
      </div>
    </FormGroup>
  );
};

export default SinglePeriodPicker;
