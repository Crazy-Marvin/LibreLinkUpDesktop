import { ThemeType, useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import SettingsLayout from "@/layouts/settings-layout"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/stores/auth"
import { countries, languages, themes, resultUnits, windowModes } from "@/config/app"
import { useTranslation } from "react-i18next"
import { setRedirectTo, sendRefreshPrimaryWindow, setWindowMode, getLocalStorageWindowMode, getTrayVisibility, setTrayVisibility} from "@/lib/utils"
import { useEffect, useState, useCallback  } from 'react';

export default function SettingsGeneralPage() {
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const theme = localStorage.getItem('vite-ui-theme')
  const language = useAuthStore((state) => state.language)
  const setLanguage = useAuthStore((state) => state.setLanguage)
  const country = useAuthStore((state) => state.country)
  const setCountry = useAuthStore((state) => state.setCountry)

  const resultUnit = useAuthStore((state) => state.resultUnit)
  const setResultUnit = useAuthStore((state) => state.setResultUnit)

  const { setTheme } = useTheme()
  const setAndRefreshTheme = (t: ThemeType) => {
    setTheme(t)
    setRedirectTo('/settings/general')
    window.location.reload();
  }
  const setAndRefreshLanguage = (l: string) => {
    i18n.changeLanguage(l)
    setLanguage(l)
  }

  const handleSetResultUnit = (value: string) => {
    setResultUnit(value);
    sendRefreshPrimaryWindow();
  }

  const handleSetWindowMode = (value: string) => {
    setWindowMode(value);
  }

  const [currentWindowMode, setCurrentWindowMode] = useState<null | string>(null);
  useEffect(() => {
    const fetchWindowMode = async () => {
      const mode = await getLocalStorageWindowMode();
      setCurrentWindowMode(mode);
    };
    fetchWindowMode();
  }, []);

  const [trayVisible, setTrayVisible] = useState<boolean>(true);

  useEffect(() => {
    const initializeTrayVisibility = () => {
      const visibility = getTrayVisibility();
      setTrayVisible(visibility);
    };

    initializeTrayVisibility();
  }, []);

  const handleToggleTray = useCallback(async (checked: boolean) => {
    setTrayVisible(checked);
    await setTrayVisibility(checked);
  }, []);

  const toggleSwitchKey = `tray-toggle-${trayVisible}`;

  return (
    <SettingsLayout>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('Theme')}</p>
          <Select onValueChange={setAndRefreshTheme} defaultValue={theme ?? ''}>
            <SelectTrigger>
              <SelectValue placeholder={t("SelectTheme")} />
            </SelectTrigger>
            <SelectContent>
              {themes.map(item => (
                <SelectItem value={item.value} key={item.value}>
                  {t(item.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('Country')}</p>
          <Select onValueChange={setCountry} defaultValue={country ?? ''}>
            <SelectTrigger>
              <SelectValue placeholder={t("SelectCountry")} />
            </SelectTrigger>
            <SelectContent>
              {countries.map(coun => (
                <SelectItem value={coun.value} key={coun.value}>
                  {t(coun.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('Language')}</p>
          <Select onValueChange={setAndRefreshLanguage} defaultValue={language ?? ''}>
            <SelectTrigger>
              <SelectValue placeholder={t("SelectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lan => (
                <SelectItem value={lan.value} key={lan.value}>
                  {t(lan.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('WindowMode')}</p>
          <Select key={currentWindowMode} onValueChange={handleSetWindowMode} defaultValue={currentWindowMode ?? 'windowed'}>
            <SelectTrigger>
              <SelectValue placeholder={("SelectMode")} />
            </SelectTrigger>
            <SelectContent>
              {windowModes.map(item => (
                <SelectItem value={item.value} key={item.value}>
                  {t(item.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('Unit')}</p>
          <Select onValueChange={handleSetResultUnit} defaultValue={resultUnit ?? 'mg/dL'}>
            <SelectTrigger>
              <SelectValue placeholder={("SelectUnit")} />
            </SelectTrigger>
            <SelectContent>
              {resultUnits.map(item => (
                <SelectItem value={item.value} key={item.value}>
                  {t(item.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">&nbsp;</p>
          <div className="flex items-center justify-between rounded-md border px-3 py-1.5">
            <span className="text-sm leading-none"> {t('Show glucose values in tray')} </span>
            <div className="scale-90 origin-right">
              <ToggleSwitch
                key={toggleSwitchKey}
                checked={trayVisible}
                onChange={handleToggleTray}
              />
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}
