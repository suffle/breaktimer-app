import React, { FC } from "react";
import { Button, FormGroup } from "@blueprintjs/core";
import { IWorkingHours } from "../../../types/settings";
import {
  ChangePeriodInterface,
  ChangeValueInterface,
} from "app/types/functions";
import SinglePeriodPicker from "./SinglePeriodPicker";

interface TimePeriodPickerProps {
  onChange: ChangeValueInterface;
  timePeriods: IWorkingHours[];
  disabled: boolean;
}

const TimePeriodPicker: FC<TimePeriodPickerProps> = ({
  onChange,
  timePeriods,
  disabled,
}) => {
  const handlePeriodChange =
    (index: number): ChangePeriodInterface =>
    (newTimePeriod) => {
      const newTimePeriods = Object.assign([], timePeriods, {
        [index]: newTimePeriod,
      });
      onChange(newTimePeriods);
    };
  const handleAddPeriod = () => {
    onChange([
      ...timePeriods,
      {
        from: new Date(),
        to: new Date(),
      },
    ]);
  };
  const handleRemovePeriod = (index: number) => () => {
    onChange(timePeriods.filter((_, i) => i !== index));
  };
  return (
    <FormGroup label="Activate Breaks">
      {timePeriods.map((timePeriod, index) => (
        <SinglePeriodPicker
          timePeriod={timePeriod}
          key={index}
          disabled={disabled}
          onChange={handlePeriodChange(index)}
          onRemove={
            timePeriods.length > 1 ? handleRemovePeriod(index) : undefined
          }
        />
      ))}
      <Button onClick={handleAddPeriod} outlined>
        Add new
      </Button>
    </FormGroup>
  );
};

export default TimePeriodPicker;
