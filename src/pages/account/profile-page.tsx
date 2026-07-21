import { LogOut, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="border-border rounded-2xl border bg-white p-6 shadow-sm md:p-8">
      <Seo title="My Profile" path="/account" noindex />
      <div className="flex items-center gap-4">
        <span className="bg-gradient-brand flex size-14 items-center justify-center rounded-2xl text-white">
          <UserRound className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold">{user?.full_name}</h2>
          <p className="text-slate text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="border-border mt-8 border-t pt-6">
        <Button variant="outline" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          Log Out
        </Button>
      </div>
    </div>
  )
}
