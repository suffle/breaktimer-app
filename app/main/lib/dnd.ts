import moment from "moment";
import { BreakTime } from "../../types/breaks";
import { buildTray } from "./tray";
import { DndTime, DND_UNTIL } from "../../types/dnd";

let dndTime: DndTime = null;

export function getDndTime(): BreakTime {
  return dndTime;
}

export function checkDnd(): boolean {
  return dndTime !== null && dndTime.isAfter(moment());
}

export function createDnd(until: number | DND_UNTIL): void {
  if (until === DND_UNTIL.TOMORROW) {
    const untilMidnight = moment()
      .set("hours", 24)
      .set("minute", 0)
      .set("second", 0);
    console.log(untilMidnight);
    dndTime = untilMidnight;
  } else {
    dndTime = moment().add(until, "minutes");
  }
  buildTray();
}

export function destroyDnd(): void {
  dndTime = null;
  buildTray();
}
