import { useEffect, useState } from "react"
import { BaseLayout } from "@/layouts/base-layout"
import { useAuthStore } from "@/stores/auth"
import { getGraphData } from "@/lib/linkup"
import { TrendArrow } from "@/components/ui/trend-arrow"
import { GearIcon } from "@radix-ui/react-icons"
import { useNavigate } from "react-router-dom"
import { LoadingScreen } from "@/components/ui/loading"

export default function DashboardPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const country = useAuthStore((state) => state.country)
  const [graphData, setGraphData] = useState({})
  const [isReady, setIsReady] = useState(false)

  const populateGraphData = async () => {
    const data = await getGraphData({
      token: token ?? "",
      country: country ?? "",
    })

    setGraphData(data)
    setIsReady(true)
  }

  const getColor = (code: number): string => {
    if (code === 1) {
      return "bg-yellow-500"
    }

    return "bg-green-500"
  }

  useEffect(() => {
    populateGraphData()

    const interval = setInterval(() => {
      populateGraphData()
    }, 1000 * 60)

    return () => clearInterval(interval)
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <BaseLayout
      className={`${getColor(graphData?.MeasurementColor ?? 1)} flex justify-center items-center`}
    >
      <button
        onClick={() => navigate('/settings/general')}
        className="absolute top-5 right-5 hover:bg-white/20 p-2 rounded-md transition-all"
      >
        <GearIcon className="text-white h-6 w-6" />
      </button>
      <div className="flex items-center gap-3">
        <p className="text-white text-3xl font-semibold">{graphData?.ValueInMgPerDl} mg/dL</p>
        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-white/25">
          <TrendArrow className="h-9 w-9 text-white" trend={graphData?.TrendArrow ?? 1} />
        </div>
      </div>
    </BaseLayout>
  )
}
