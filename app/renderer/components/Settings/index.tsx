import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab, Switch, FormGroup, Intent } from "@blueprintjs/core";
import {
  Settings,
  NotificationType,
  SETTING_TYPES,
} from "../../../types/settings";
import { toast } from "../../toaster";
import SettingsHeader from "./SettingsHeader";
import styles from "./index.scss";
import BreakSettings from "./BreakSettings";
import CustomizationSettings from "./CustomizationSettings";
import WorkingHoursSettings from "./WorkingHoursSettings";
import IdleResetSettings from "./IdleResetSettings";
import SystemSettings from "./SystemSettings";
import { defaultColors } from "../../../lib/defaultSettings";
import { ChangeSettingsInterface } from "../../../types/functions";
import customDebug from "../../../lib/debug";

export default function Settings() {
  const [settingsDraft, setSettingsDraft] = useState<Settings | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;
      setSettingsDraft(settings);
      setSettings(settings);
    };
    fetchSettings();
  }, []);

  const dirty = useMemo(() => {
    return JSON.stringify(settingsDraft) !== JSON.stringify(settings);
  }, [settings, settingsDraft]);

  if (settings === null || settingsDraft === null) {
    return null;
  }

  const updateSettingsDraft = (newSettings: Settings): void => {
    customDebug("Settings", newSettings, settingsDraft);
    setSettingsDraft(newSettings);
  };

  const handleChangeSettings: ChangeSettingsInterface =
    (settingsType) => (fieldName) => (value) => {
      updateSettingsDraft({
        ...settingsDraft,
        [settingsType]: {
          ...settingsDraft[settingsType],
          [fieldName]: value,
        },
      });
    };

  const handleResetColors = (): void => {
    const { customizationSettings, ...settings } = settingsDraft;
    setSettingsDraft({
      ...settings,
      customizationSettings: {
        ...customizationSettings,
        ...defaultColors,
      },
    });
  };

  const handleSave = async () => {
    await ipcRenderer.invokeSetSettings(settingsDraft);
    toast("Settings saved", Intent.PRIMARY);
    setSettings(settingsDraft);
  };

  return (
    <div className={styles.container}>
      <SettingsHeader
        backgroundColor={settingsDraft.customizationSettings.backgroundColor}
        handleSave={handleSave}
        showSave={dirty}
        textColor={settingsDraft.customizationSettings.textColor}
      />
      <main className={styles.settings}>
        <FormGroup>
          <Switch
            label="Breaks enabled"
            checked={settingsDraft.breakSettings.breaksEnabled}
            onChange={(e) =>
              handleChangeSettings(SETTING_TYPES.BREAK_SETTINGS)(
                "breaksEnabled"
              )(e.currentTarget.checked)
            }
          />
        </FormGroup>
        <Tabs defaultSelectedTabId="break-settings">
          <Tab
            id="break-settings"
            title="Break Settings"
            panel={
              <BreakSettings
                onChange={handleChangeSettings(SETTING_TYPES.BREAK_SETTINGS)}
                settings={settingsDraft.breakSettings}
              />
            }
          />
          <Tab
            id="customization"
            title="Customization"
            panel={
              <CustomizationSettings
                onChange={handleChangeSettings(
                  SETTING_TYPES.CUSTOMIZATION_SETTINGS
                )}
                onResetColors={handleResetColors}
                isBreaksEnabled={settingsDraft.breakSettings.breaksEnabled}
                disableBackdropChange={
                  settingsDraft.breakSettings.notificationType !==
                  NotificationType.Popup
                }
                settings={settingsDraft.customizationSettings}
              />
            }
          />
          <Tab
            id="working-hours"
            title="Working Hours"
            panel={
              <WorkingHoursSettings
                onChange={handleChangeSettings(
                  SETTING_TYPES.WORKING_HOURS_SETTINGS
                )}
                isBreaksEnabled={settingsDraft.breakSettings.breaksEnabled}
                settings={settingsDraft.workingHoursSettings}
              />
            }
          />
          <Tab
            id="idle-reset"
            title="Idle Reset"
            panel={
              <IdleResetSettings
                onChange={handleChangeSettings(
                  SETTING_TYPES.IDLE_RESET_SETTINGS
                )}
                isBreaksEnabled={settingsDraft.breakSettings.breaksEnabled}
                settings={settingsDraft.idleResetSettings}
              />
            }
          />
          {processEnv.SNAP === undefined && (
            <Tab
              id="system"
              title="System"
              panel={
                <SystemSettings
                  onChange={handleChangeSettings(SETTING_TYPES.SYSTEM_SETTINGS)}
                  settings={settingsDraft.systemSettings}
                />
              }
            />
          )}
        </Tabs>
      </main>
    </div>
  );
}
