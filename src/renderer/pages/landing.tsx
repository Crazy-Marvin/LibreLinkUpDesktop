import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PublicLayout } from "@/layouts/public-layout"
import logo from "../../../assets/logo.png"

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login')
    }, 3000);
    return () => clearTimeout(timer);
  }, [])

  return (
    <PublicLayout
      className="flex justify-center items-center"
    >
      <div className="flex flex-col items-center gap-3 animate-pulse pt-24">
        <img src={logo} width={80} />
        <h2 className="font-semibold">LibreLinkUp Desktop</h2>
      </div>
    </PublicLayout>
  )
}
