import { ExternalLink, MessageCircle, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { registrationStatusLabels } from '../../../utils/labels'
import { useWhatsAppMessage } from '../../whatsapp/providers/WhatsAppMessageContext'
import {
  getStudentParent,
  getStudentProgramLabel,
} from '../services/studentService'
import type { StudentRecord } from '../types'

type StudentCardProps = {
  student: StudentRecord
}

export function StudentCard({ student }: StudentCardProps) {
  const parent = getStudentParent(student)
  const { openWhatsAppMessage } = useWhatsAppMessage()

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-950">
            {student.full_name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {parent?.full_name ?? 'Veli yok'}
          </p>
        </div>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {student.age ? `${student.age} yaş` : 'Yaş yok'}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium text-neutral-500">Program</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {getStudentProgramLabel(student)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-neutral-500">Kayıt</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {student.active_registration_status
              ? registrationStatusLabels[student.active_registration_status]
              : '-'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Link
          to={`/students/${student.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Detay
        </Link>
        {parent ? (
          <Link
            to={`/parents/${parent.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            Veliye Git
          </Link>
        ) : null}
        <button
          type="button"
          disabled={!parent?.phone}
          onClick={() =>
            parent &&
            openWhatsAppMessage({
              defaultCategory: 'ogrenci',
              entityId: student.id,
              entityType: 'student',
              name: parent.full_name,
              phone: parent.phone,
              variables: {
                ogrenci_adi: student.full_name,
                ogrenci_yasi: student.age,
                veli_adi: parent.full_name,
                veli_telefonu: parent.phone,
              },
            })
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </button>
      </div>
    </article>
  )
}
