import { supabase } from '../../../lib/supabase'
import type { Note } from '../../../types/database'

export type NoteEntityType = 'parent' | 'student'

export type NoteRecord = Note & {
  user?: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null
}

type ServiceResult<T> = {
  data?: T
  error?: string
}

const noteSelect = `
  *,
  user:profiles (
    id,
    full_name
  )
`

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export function getNoteUser(note: NoteRecord) {
  return normalizeRelation(note.user)
}

export async function fetchNotes(
  entityType: NoteEntityType,
  entityId: string,
): Promise<ServiceResult<NoteRecord[]>> {
  const { data, error } = await supabase
    .from('notes')
    .select(noteSelect)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: 'Notlar alınamadı.' }
  }

  return { data: (data ?? []) as NoteRecord[] }
}

export async function addNote(
  entityType: NoteEntityType,
  entityId: string,
  note: string,
  userId: string | null,
): Promise<ServiceResult<NoteRecord>> {
  const trimmedNote = note.trim()

  if (!trimmedNote) {
    return { error: 'Not alanı boş bırakılamaz.' }
  }

  if (!userId) {
    return { error: 'Oturum kullanıcısı bulunamadı.' }
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      entity_id: entityId,
      entity_type: entityType,
      note: trimmedNote,
      user_id: userId,
    })
    .select(noteSelect)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Not eklenemedi.' }
  }

  return { data: data as NoteRecord }
}
