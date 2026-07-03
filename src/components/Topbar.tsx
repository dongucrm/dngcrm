import { Bell, Menu, Search, UserRound } from 'lucide-react'

type TopbarProps = {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Menüyü aç"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <label className="relative hidden max-w-md sm:block">
          <span className="sr-only">Ara</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Ara"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <button
        type="button"
        aria-label="Bildirimler"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Profil"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
      >
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  )
}
