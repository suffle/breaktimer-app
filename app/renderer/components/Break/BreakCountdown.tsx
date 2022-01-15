import React, { FC, useEffect, useState } from "react";
import moment from "moment";
import { Button, Spinner, ControlGroup, ButtonGroup } from "@blueprintjs/core";
import { useSpring, animated, config } from "react-spring";
import styles from "./index.scss";
import { TICK_MS } from "./index";

const COUNTDOWN_SECS = 10;

interface BreakCountdownProps {
  breakTitle: string;
  onCountdownOver: () => void;
  onPostponeBreak: () => void;
  onSkipBreak: () => void;
  postponeBreakEnabled: boolean;
  skipBreakEnabled: boolean;
  textColor: string;
}

const BreakCountdown: FC<BreakCountdownProps> = ({
  breakTitle,
  onCountdownOver,
  onPostponeBreak,
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

  return (
    <animated.div className={styles.breakCountdown} style={fadeIn}>
      <h2
        className={styles.breakTitle}
        dangerouslySetInnerHTML={{ __html: breakTitle }}
      />
      {(skipBreakEnabled || postponeBreakEnabled) && (
        <ControlGroup>
          <ButtonGroup>
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
