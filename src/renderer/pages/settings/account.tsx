import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import SettingsLayout from "@/layouts/settings-layout"
import { getConnection } from "@/lib/linkup"
import { useAuthStore } from "@/stores/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClearSession } from "@/hooks/session"

export default function SettingsAccountPage() {
  const { clearSession } = useClearSession()
  const { t } = useTranslation()
  const [connection, setConnection] = useState({})
  const token = useAuthStore((state) => state.token)
  const country = useAuthStore((state) => state.country)

  const getConnectionData = async () => {
    const data = await getConnection({ token: token ?? '', country: country ?? '' })

    if (data === null) {
      clearSession()
      return
    }

    setConnection(data)
  }

  useEffect(() => {
    getConnectionData()
  }, [])

  return (
    <SettingsLayout>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('First Name')}</p>
          <Input placeholder="Name" value={connection?.firstName} />
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">{t('Last Name')}</p>
          <Input placeholder="Name" value={connection?.lastName} />
        </div>
        <div>
          <Button onClick={clearSession} className="w-full">Logout</Button>
        </div>
      </div>

    </SettingsLayout>
  )
}
