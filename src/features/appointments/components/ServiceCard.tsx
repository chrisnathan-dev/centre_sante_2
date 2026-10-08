import type { AppointmentService } from '../types'

type ServiceCardProps = {
  service: AppointmentService
  selected: boolean
  onSelect: () => void
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={`card border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? 'border-teal-700 ring-2 ring-teal-700/20' : 'border-slate-200'
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="card-body gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-teal-50 text-lg font-bold text-teal-700">+</span>
          {selected ? <span className="badge badge-primary">Sélectionné</span> : null}
        </div>
        <h3 className="card-title text-lg text-slate-950">{service.name}</h3>
        <p className="text-sm leading-6 text-slate-600">{service.description}</p>
      </div>
    </button>
  )
}
