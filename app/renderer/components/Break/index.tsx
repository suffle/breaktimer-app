import React, { FC, useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import { Settings } from "../../../types/settings";
import styles from "./index.scss";
import BreakCountdown from "./BreakCountdown";
import BreakProgress from "./BreakProgress";

export const TICK_MS = 200;

function createRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const Break: FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [countingDown, setCountingDown] = useState(true);
  const [allowPostpone, setAllowPostpone] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const [anim, animApi] = useSpring(() => ({
    width: 0,
    height: 0,
    backgroundOpacity: 0,
    backdropOpacity: 0,
  }));

  useEffect(() => {
    setTimeout(async () => {
      animApi({
        backgroundOpacity: 0.8,
        backdropOpacity: 1,
        width: 250,
        height: 250,
      });
      const allowPostpone = await ipcRenderer.invokeGetAllowPostpone();
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;

      // Skip the countdown if these are disabled
      if (
        !settings.breakSettings.skipBreakEnabled &&
        !(settings.breakSettings.postponeBreakEnabled && allowPostpone)
      ) {
        setCountingDown(false);
      }

      setAllowPostpone(await ipcRenderer.invokeGetAllowPostpone());
      setSettings(settings);
      setReady(true);
    }, 1000);
  }, [animApi]);

  const handleCountdownOver = React.useCallback(() => {
    setCountingDown(false);
  }, []);

  useEffect(() => {
    if (!countingDown) {
      animApi({ backgroundOpacity: 1, width: 400, height: 400 });
    }
  }, [countingDown, animApi]);

  useEffect(() => {
    if (closing) {
      animApi({ backgroundOpacity: 0, width: 0, height: 0 });
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [animApi, closing]);

  const handlePostponeBreak = React.useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone();
    setClosing(true);
  }, []);

  const handleSkipBreak = React.useCallback(() => {
    setClosing(true);
  }, []);

  const handleEndBreak = React.useCallback(() => {
    if (settings?.breakSettings.gongEnabled) {
      // For some reason the end gong sometimes sounds very distorted, so just
      // reuse the start gong.
      ipcRenderer.invokeGongStartPlay();
    }
    setClosing(true);
  }, [settings]);

  if (settings === null || allowPostpone === null) {
    return null;
  }

  return (
    <animated.div
      className={`bp3-dark ${styles.breakContainer}`}
      style={{
        backgroundColor: settings.customizationSettings.showBackdrop
          ? createRgba(
              settings.customizationSettings.backdropColor,
              settings.customizationSettings.backdropOpacity
            )
          : "initial",
        opacity: anim.backdropOpacity,
      }}
    >
      <animated.div
        className={styles.break}
        style={{
          width: anim.width,
          height: anim.height,
          color: settings.customizationSettings.textColor,
        }}
      >
        <animated.div
          className={styles.background}
          style={{
            width: anim.width,
            height: anim.height,
            opacity: anim.backgroundOpacity,
            backgroundColor: settings.customizationSettings.backgroundColor,
          }}
        />
        {ready && !closing && (
          <>
            {countingDown ? (
              <BreakCountdown
                breakTitle={settings.customizationSettings.breakTitle}
                onCountdownOver={handleCountdownOver}
                onPostponeBreak={handlePostponeBreak}
                onSkipBreak={handleSkipBreak}
                postponeBreakEnabled={
                  settings.breakSettings.postponeBreakEnabled && allowPostpone
                }
                skipBreakEnabled={settings.breakSettings.skipBreakEnabled}
                textColor={settings.customizationSettings.textColor}
              />
            ) : (
              <BreakProgress
                breakMessage={settings.customizationSettings.breakMessage}
                endBreakEnabled={settings.breakSettings.endBreakEnabled}
                onEndBreak={handleEndBreak}
                settings={settings}
                textColor={settings.customizationSettings.textColor}
              />
            )}
          </>
        )}
      </animated.div>
    </animated.div>
  );
};
export default Break;
