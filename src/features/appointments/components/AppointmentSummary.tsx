import type { AppointmentRequest } from '../types'

type AppointmentSummaryProps = {
  request: AppointmentRequest
  onEdit: () => void
  onConfirm: () => void
  error: string
  isSubmitting: boolean
}

export function AppointmentSummary({ request, onEdit, onConfirm, error, isSubmitting }: AppointmentSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['Service', request.service.name],
          ['Médecin', request.doctor.name],
          ['Date', request.slot.dateLabel],
          ['Heure', request.slot.time],
          ['Motif', request.reason],
          ['Précision', request.details || 'Aucune précision ajoutée'],
        ].map(([label, value]) => (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      {error ? <p className="alert alert-error text-sm" role="alert">{error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button className="btn btn-ghost" onClick={onEdit} type="button">Modifier</button>
        <button className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" disabled={isSubmitting} onClick={onConfirm} type="button">{isSubmitting ? 'Transmission…' : 'Confirmer la demande'}</button>
      </div>
    </div>
  )
}
