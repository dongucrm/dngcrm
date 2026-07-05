import { useState, type FormEvent } from 'react'

type NoteFormProps = {
  saving: boolean
  onSubmit: (note: string) => Promise<{ error?: string }>
}

export function NoteForm({ onSubmit, saving }: NoteFormProps) {
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const result = await onSubmit(note)

    if (result.error) {
      setError(result.error)
      return
    }

    setNote('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <label className="block">
        <span className="sr-only">Not</span>
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Not ekle"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? 'Ekleniyor...' : 'Not Ekle'}
        </button>
      </div>
    </form>
  )
}
