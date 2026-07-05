import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { formatNullableDateTime } from '../../../utils/date'
import {
  addNote,
  fetchNotes,
  getNoteUser,
  type NoteEntityType,
  type NoteRecord,
} from '../services/noteService'
import { NoteForm } from './NoteForm'

type NotesSectionProps = {
  entityId: string
  entityType: NoteEntityType
  title?: string
}

export function NotesSection({
  entityId,
  entityType,
  title = 'Notlar',
}: NotesSectionProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchNotes(entityType, entityId)

    if (result.error) {
      setNotes([])
      setError(result.error)
      setLoading(false)
      return
    }

    setNotes(result.data ?? [])
    setLoading(false)
  }, [entityId, entityType])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  async function handleAddNote(note: string) {
    setSaving(true)
    const result = await addNote(entityType, entityId, note, user?.id ?? null)
    setSaving(false)

    if (result.error) {
      return { error: result.error }
    }

    await loadNotes()

    return {}
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {notes.length} not
        </span>
      </div>

      <NoteForm saving={saving} onSubmit={handleAddNote} />

      {loading ? (
        <p className="mt-4 text-sm font-medium text-neutral-600">
          Notlar yükleniyor...
        </p>
      ) : error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : notes.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Henüz not eklenmedi.</p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200">
          {notes.map((note) => {
            const noteUser = getNoteUser(note)

            return (
              <article key={note.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-neutral-950">
                    {noteUser?.full_name ?? 'Kullanıcı'}
                  </p>
                  <p className="text-xs font-medium text-neutral-500">
                    {formatNullableDateTime(note.created_at)}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                  {note.note}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
