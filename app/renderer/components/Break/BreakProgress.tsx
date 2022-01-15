import React, { FC, useEffect, useState } from "react";
import moment from "moment";
import { Button } from "@blueprintjs/core";
import { useSpring, animated, config } from "react-spring";
import styles from "./index.scss";
import { Settings } from "../../../types/settings";
import OuterSpinner from "./OuterSpinner";
import { TICK_MS } from "./index";

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

interface BreakProgressProps {
  breakMessage: string;
  endBreakEnabled: boolean;
  onEndBreak: () => void;
  settings: Settings;
  textColor: string;
}

const BreakProgress: FC<BreakProgressProps> = ({
  breakMessage,
  endBreakEnabled,
  onEndBreak,
  settings,
  textColor,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );
  const [progress, setProgress] = React.useState<number | null>(null);

  useEffect(() => {
    if (settings.breakSettings.gongEnabled) {
      ipcRenderer.invokeGongStartPlay();
    }
    const endBreak = async () => {
      const length = new Date(await ipcRenderer.invokeGetBreakLength());
      const breakEndTime = moment()
        .add(length.getHours(), "hours")
        .add(length.getMinutes(), "minutes")
        .add(length.getSeconds(), "seconds");

      const startMsRemaining = moment(breakEndTime).diff(
        moment(),
        "milliseconds"
      );

      const tick = () => {
        const now = moment();

        if (now > moment(breakEndTime)) {
          onEndBreak();
          return;
        }

        const msRemaining = moment(breakEndTime).diff(now, "milliseconds");
        setProgress(1 - msRemaining / startMsRemaining);
        setTimeRemaining({
          hours: Math.floor(msRemaining / 1000 / 3600),
          minutes: Math.floor(msRemaining / 1000 / 60),
          seconds: (msRemaining / 1000) % 60,
        });
        setTimeout(tick, TICK_MS);
      };

      tick();
    };

    endBreak();
  }, [onEndBreak, settings]);

  const fadeIn = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: config.slow,
    delay: 500,
  });

  if (timeRemaining === null || progress === null) {
    return null;
  }

  return (
    <animated.div className={styles.breakProgress} style={fadeIn}>
      <OuterSpinner value={progress} textColor={textColor} />
      <div className={styles.progressContent}>
        <h1
          className={styles.breakMessage}
          dangerouslySetInnerHTML={{ __html: breakMessage }}
        />
        {endBreakEnabled && (
          <Button
            className={styles.actionButton}
            onClick={onEndBreak}
            outlined
            autoFocus={true}
            style={{ color: textColor }}
          >
            End
          </Button>
        )}
      </div>
    </animated.div>
  );
};

export default BreakProgress;
