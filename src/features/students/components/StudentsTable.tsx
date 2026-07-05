import { ExternalLink, FilePlus2, NotebookPen, Pencil, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { registrationStatusLabels } from '../../../utils/labels'
import {
  getStudentParent,
  getStudentProgramLabel,
} from '../services/studentService'
import type { StudentRecord } from '../types'

type StudentsTableProps = {
  students: StudentRecord[]
  onEdit: (student: StudentRecord) => void
}

export function StudentsTable({ onEdit, students }: StudentsTableProps) {
  return (
    <section className="hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {[
                'Öğrenci adı',
                'Yaş',
                'Veli adı',
                'Veli telefonu',
                'Aktif program',
                'Kayıt durumu',
                'İşlemler',
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500 last:text-right"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {students.map((student) => {
              const parent = getStudentParent(student)

              return (
                <tr key={student.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-neutral-950">
                      {student.full_name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {student.school || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {student.age ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {parent?.full_name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {parent?.phone ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {getStudentProgramLabel(student)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {student.active_registration_status
                      ? registrationStatusLabels[student.active_registration_status]
                      : '-'}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/students/${student.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Detay
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(student)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Düzenle
                      </button>
                      {parent ? (
                        <Link
                          to={`/parents/${parent.id}`}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                        >
                          <UsersRound
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Veli
                        </Link>
                      ) : null}
                      <Link
                        to={`/students/${student.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <FilePlus2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Kayıt
                      </Link>
                      <Link
                        to={`/students/${student.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <NotebookPen
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Not
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
