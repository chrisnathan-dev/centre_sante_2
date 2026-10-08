import type { Doctor } from '../types'

type DoctorCardProps = {
  doctor: Doctor
  selected: boolean
  onSelect: () => void
}

export function DoctorCard({ doctor, selected, onSelect }: DoctorCardProps) {
  return (
    <article className={`card border bg-white shadow-sm transition ${selected ? 'border-teal-700 ring-2 ring-teal-700/20' : 'border-slate-200'}`}>
      <div className="card-body gap-4 p-5 sm:flex-row sm:items-center">
        {doctor.photoUrl ? (
          <img
            alt={`Portrait de ${doctor.name}`}
            className="size-20 rounded-2xl object-cover ring-4 ring-teal-50"
            loading="lazy"
            src={doctor.photoUrl}
          />
        ) : (
          <div aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-2xl bg-teal-100 text-2xl font-semibold text-teal-800">
            {doctor.name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-950">{doctor.name}</h3>
          <p className="mt-1 text-sm font-medium text-teal-700">{doctor.specialty}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-emerald-700">
            <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />
            {doctor.availabilityLabel}
          </p>
        </div>
        <button
          className={`btn btn-sm w-full sm:w-auto ${selected ? 'btn-primary bg-teal-700 text-white' : 'btn-outline border-teal-700 text-teal-800 hover:bg-teal-700 hover:text-white'}`}
          onClick={onSelect}
          type="button"
        >
          {selected ? 'Médecin choisi' : 'Choisir ce médecin'}
        </button>
      </div>
    </article>
  )
}
