import React, { useState } from 'react';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import SettingsLayout from '@/layouts/settings-layout';
import { useAlertStore } from '@/stores/alertStore';
import { useTranslation } from 'react-i18next';
import { uploadCustomAlertSoundFile, sendRefreshPrimaryWindow } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsAlertPage() {
  const { t } = useTranslation();

  const {
    bringToFrontEnabled,
    flashWindowEnabled,
    audioAlertEnabled,
    useCustomSound,
    overrideThreshold,
    customTargetHigh,
    customTargetLow,

    setBringToFrontEnabled,
    setFlashWindowEnabled,
    setAudioAlertEnabled,
    setUserCustomSoundEnabled,
    setOverrideThreshold,
    setCustomTargetLow,
    setCustomTargetHigh,
  } = useAlertStore();

  const handleBringToFrontChange = (checked: boolean) => {
    setBringToFrontEnabled(checked);
  };

  const handleFlashWindowChange = (checked: boolean) => {
    setFlashWindowEnabled(checked);
  };

  const handleAudioAlertChange = (checked: boolean) => {
    setAudioAlertEnabled(checked);
  };

  const handleUserCustomSoundChange = (checked: boolean) => {
    setUserCustomSoundEnabled(checked);
  };

  const handleOverrideChange = (checked: boolean) => {
    setOverrideThreshold(checked);
  };

  const handleTargetLowChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomTargetLow(Number(event.target.value));
  };

  const handleTargetHighChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomTargetHigh(Number(event.target.value));
  };

  const handleApplyChanges = () => {
    sendRefreshPrimaryWindow();
    // sendRefreshAllWindows();
  };

  // TODO:: use a button and trigger this function
  const uploadCustomAlertSound = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.mp3';
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target?.files ? target.files[0] : null;
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          if (reader.result) {
            const arrayBuffer = reader.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            await uploadCustomAlertSoundFile(Array.from(uint8Array));
          }
        };

        reader.onerror = () => {
          console.error('uploadCustomAlertSound:', reader.error);
        };

        reader.readAsArrayBuffer(file);
      }
    };
    fileInput.click();
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="text-gray-400">{t('ALERT_DESCRIPTION')}</div>

        <div className="flex flex-row justify-between gap-4">
          <p className="text-gray-400">{t('Bring Window to Front')}</p>
          <ToggleSwitch
            checked={bringToFrontEnabled}
            onChange={handleBringToFrontChange}
          />
        </div>

        <div className="flex flex-row justify-between gap-4">
          <p className="text-gray-400">{t('Flash Window')}</p>
          <ToggleSwitch
            checked={flashWindowEnabled}
            onChange={handleFlashWindowChange}
          />
        </div>

        <div className="flex flex-row justify-between gap-4">
          <p className="text-gray-400">{t('Play Sound')}</p>
          <ToggleSwitch
            checked={audioAlertEnabled}
            onChange={handleAudioAlertChange}
          />
        </div>

        {audioAlertEnabled && (
          <div className="flex flex-row justify-between gap-4">
            <p className="text-gray-400">{t('Use Custom Sound')}</p>
            <ToggleSwitch
              checked={useCustomSound}
              onChange={handleUserCustomSoundChange}
            />
          </div>
        )}

        {audioAlertEnabled && useCustomSound && (
          <div className="flex flex-row justify-between gap-4">
            <Button onClick={uploadCustomAlertSound}>
              {' '}
              {t('Upload Sound')}
            </Button>
          </div>
        )}

        <div className="flex flex-row justify-between gap-4">
          <p className="text-gray-400">{t('Custom Alert Level')}</p>
          <ToggleSwitch
            checked={overrideThreshold}
            onChange={handleOverrideChange}
          />
        </div>

        {overrideThreshold && (
          <div className="flex flex-row justify-start gap-4">
            <div>
              <p className="text-foreground/30 text-xs mb-2">
                {t('Min Value')} ({t('mg/dL')})
              </p>
              <Input
                type="number"
                placeholder={t('Enter Value')}
                value={String(customTargetLow)}
                onChange={handleTargetLowChanged}
              />
            </div>
            <div>
              <p className="text-foreground/30 text-xs mb-2">
                {t('Max Value')} ({t('mg/dL')})
              </p>
              <Input
                type="number"
                placeholder={t('Enter Value')}
                value={String(customTargetHigh)}
                onChange={handleTargetHighChanged}
              />
            </div>
          </div>
        )}

        <div>
          <Button onClick={handleApplyChanges}>{t('Apply Changes')}</Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
