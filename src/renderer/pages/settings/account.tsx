import { useEffect, useState } from "react"
import SettingsLayout from "@/layouts/settings-layout"
import { getConnection } from "@/lib/linkup"
import { useAuthStore } from "@/stores/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function SettingsAccountPage() {
  const navigate = useNavigate()
  const [connection, setConnection] = useState({})
  const logout = useAuthStore((state) => state.logout)
  const token = useAuthStore((state) => state.token)
  const country = useAuthStore((state) => state.country)

  const getConnectionData = async () => {
    const data = await getConnection({ token: token ?? '', country: country ?? '' })
    setConnection(data)
    console.log(data)
  }

  const clearSession = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    getConnectionData()
  }, [])

  return (
    <SettingsLayout>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-foreground/30 text-xs mb-2">First Name</p>
          <Input placeholder="Name" value={connection?.firstName} />
        </div>
        <div>
          <p className="text-foreground/30 text-xs mb-2">Last Name</p>
          <Input placeholder="Name" value={connection?.lastName} />
        </div>
        <div>
          <Button onClick={clearSession} className="w-full">Logout</Button>
        </div>
      </div>

    </SettingsLayout>
  )
}
