import { ThemeType, useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
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
import { countries, languages } from "@/config/app"
import { useTranslation } from "react-i18next"
import { setRedirectTo } from "@/lib/utils"

export default function SettingsGeneralPage() {
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const theme = localStorage.getItem('vite-ui-theme')
  const language = useAuthStore((state) => state.language)
  const setLanguage = useAuthStore((state) => state.setLanguage)
  const country = useAuthStore((state) => state.country)
  const setCountry = useAuthStore((state) => state.setCountry)

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

  return (
    <SettingsLayout>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-foreground/30 text-xs mb-2">Theme</p>
          <div className="border rounded-md">
            <Button
              className={cn(theme === 'dark' ? 'bg-primary/10 border border-primary' : '')}
              variant="ghost"
              onClick={() => setAndRefreshTheme('dark')}
            >
              {t('Dark')}
            </Button>
            <Button
              className={cn(theme === 'light' ? 'bg-primary/10 border border-primary' : '')}
              variant="ghost"
              onClick={() => setAndRefreshTheme('light')}
            >
              {t('Light')}
            </Button>
            <Button
              className={cn(theme === 'system' ? 'bg-primary/10 border border-primary' : '')}
              variant="ghost"
              onClick={() => setAndRefreshTheme('system')}
            >
              {t('System')}
            </Button>
          </div>
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">Country</p>
          <Select onValueChange={setCountry} defaultValue={country ?? ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
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
          <p className="text-foreground/30 text-xs mb-2">Language</p>
          <Select onValueChange={setAndRefreshLanguage} defaultValue={language ?? ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
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
      </div>
    </SettingsLayout>
  )
}
