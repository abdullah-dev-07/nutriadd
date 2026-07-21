import { MapPinned } from 'lucide-react'

import { Seo } from '@/components/shared/seo'

export default function AddressesPage() {
  return (
    <div className="border-border flex flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm md:p-14">
      <Seo title="Saved Addresses" path="/account/addresses" noindex />
      <span className="bg-gradient-brand flex size-16 items-center justify-center rounded-2xl text-white">
        <MapPinned className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
        Saved Addresses Are Coming Soon
      </h2>
      <p className="text-slate mt-4 text-lg leading-relaxed">
        You&apos;ll soon be able to save shipping addresses here for faster
        checkout. For now, you can enter your address at checkout each time.
      </p>
    </div>
  )
}
