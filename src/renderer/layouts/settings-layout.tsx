import { Button } from "@/components/ui/button"
import { BaseLayout } from "@/layouts/base-layout"
import { cn } from "@/lib/utils"
import { ArrowLeftIcon, MixerVerticalIcon, PersonIcon } from "@radix-ui/react-icons"
import { ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

type Props = {
  children: ReactNode
}

function SidebarButton({ label, url, icon }: { label: string, url: string, icon: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = url === location.pathname

  return (
    <Button
      onClick={() => navigate(url)}
      variant="transparent"
      className={cn(
        'w-full flex justify-start',
        isActive ? 'text-primary bg-primary/10' : '',
      )}
    >
      {icon}
      <p>{label}</p>
    </Button>
  )
}

export default function SettingsLayout({ children }: Props) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <BaseLayout
      className="px-3 py-9 flex flex-col"
    >
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        <ArrowLeftIcon className="h-5 w-5 mr-3" />
        <p className="text-lg">
          {t('settings')}
        </p>
      </Button>
      <div className="flex mt-3">
        <div className="w-[280px] flex flex-col gap-1">
          <SidebarButton
            label={t('general')}
            url="/settings/general"
            icon={<MixerVerticalIcon className="mr-3" />}
          />
          <SidebarButton
            label={t('account')}
            url="/settings/account"
            icon={<PersonIcon className="mr-3" />}
          />
        </div>
        <div className="flex-1 px-6">
          {children}
        </div>
      </div>
    </BaseLayout>
  )
}
