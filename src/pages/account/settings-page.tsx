import { Settings } from 'lucide-react'

import { Seo } from '@/components/shared/seo'

export default function SettingsPage() {
  return (
    <div className="border-border flex flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm md:p-14">
      <Seo title="Account Settings" path="/account/settings" noindex />
      <span className="bg-gradient-brand flex size-16 items-center justify-center rounded-2xl text-white">
        <Settings className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
        Account Settings Are Coming Soon
      </h2>
      <p className="text-slate mt-4 text-lg leading-relaxed">
        Password changes and notification preferences will be available here
        soon. In the meantime, reach out to our team for any account changes.
      </p>
    </div>
  )
}
