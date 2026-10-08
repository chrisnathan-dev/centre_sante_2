import type { AppointmentSlot } from '../types'

type TimeSlotProps = {
  slot: AppointmentSlot
  selected: boolean
  onSelect: () => void
}

export function TimeSlot({ slot, selected, onSelect }: TimeSlotProps) {
  return (
    <button
      aria-pressed={selected}
      className={`btn btn-sm ${selected ? 'btn-primary bg-teal-700 text-white' : 'btn-outline border-slate-300 text-slate-700 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-800'}`}
      disabled={!slot.available}
      onClick={onSelect}
      type="button"
    >
      {slot.time}
    </button>
  )
}
