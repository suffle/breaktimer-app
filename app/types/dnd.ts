import { Moment } from "moment";

export enum DND_UNTIL {
  TOMORROW = "tomorrow",
}
export type DndTime = Moment | null;
