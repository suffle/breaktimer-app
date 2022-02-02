import React, { FC, useEffect, useState } from "react";
import moment from "moment";
import {
  Button,
  Spinner,
  ControlGroup,
  ButtonGroup,
  Menu,
  MenuItem,
} from "@blueprintjs/core";
import { Popover2 as Popover } from "@blueprintjs/popover2";
import { useSpring, animated, config } from "react-spring";
import styles from "./index.scss";
import { TICK_MS } from "./index";
import { DND_UNTIL } from "../../../types/dnd";

const COUNTDOWN_SECS = 10;

interface BreakCountdownProps {
  breakTitle: string;
  onCountdownOver: () => void;
  onPostponeBreak: () => void;
  onSetDnd: (until: number | DND_UNTIL) => void;
  onSkipBreak: () => void;
  postponeBreakEnabled: boolean;
  skipBreakEnabled: boolean;
  textColor: string;
}

const BreakCountdown: FC<BreakCountdownProps> = ({
  breakTitle,
  onCountdownOver,
  onPostponeBreak,
  onSetDnd,
  onSkipBreak,
  postponeBreakEnabled,
  skipBreakEnabled,
  textColor,
}) => {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const endCountdown = async () => {
      const countdownEndTime = moment().add(COUNTDOWN_SECS, "seconds");

      const tick = () => {
        const now = moment();

        if (now > countdownEndTime) {
          onCountdownOver();
          return;
        }

        const msRemaining = countdownEndTime.diff(now, "milliseconds");
        setProgress(1 - msRemaining / 1000 / COUNTDOWN_SECS);
        setTimeout(tick, TICK_MS);
      };

      tick();
    };

    endCountdown();
  }, [onCountdownOver]);

  const fadeIn = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: config.slow,
    delay: 500,
  });

  if (progress === null) {
    return null;
  }

  const DndMenu = (
    <Menu key="menu">
      <MenuItem text="For 1 Hour" onClick={() => onSetDnd(60)} />
      <MenuItem text="For 2 Hours" onClick={() => onSetDnd(120)} />
      <MenuItem
        text="Until tomorrow"
        onClick={() => onSetDnd(DND_UNTIL.TOMORROW)}
      />
    </Menu>
  );

  return (
    <animated.div className={styles.breakCountdown} style={fadeIn}>
      <h2
        className={styles.breakTitle}
        dangerouslySetInnerHTML={{ __html: breakTitle }}
      />
      {(skipBreakEnabled || postponeBreakEnabled) && (
        <ControlGroup>
          <ButtonGroup>
            <Popover content={DndMenu} minimal={true} placement={"bottom"}>
              <Button
                className={styles.actionButton}
                rightIcon="caret-down"
                outlined
                style={{ color: textColor }}
              >
                DND
              </Button>
            </Popover>
            {skipBreakEnabled && (
              <Button
                className={styles.actionButton}
                onClick={onSkipBreak}
                icon={<Spinner value={1 - progress} size={16} />}
                outlined
                autoFocus={true}
                style={{ color: textColor }}
              >
                Skip
              </Button>
            )}
            {postponeBreakEnabled && (
              <Button
                className={styles.actionButton}
                onClick={onPostponeBreak}
                icon={<Spinner value={1 - progress} size={16} />}
                outlined
                autoFocus={true}
                style={{ color: textColor }}
              >
                Snooze
              </Button>
            )}
          </ButtonGroup>
        </ControlGroup>
      )}
    </animated.div>
  );
};
export default BreakCountdown;
