import { useState, type FormEvent } from 'react'

type AppointmentFormProps = {
  initialReason: string
  initialDetails: string
  onSubmit: (reason: string, details: string) => void
  onBack: () => void
}

export function AppointmentForm({ initialReason, initialDetails, onSubmit, onBack }: AppointmentFormProps) {
  const [reason, setReason] = useState(initialReason)
  const [details, setDetails] = useState(initialDetails)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!reason.trim()) {
      setError('Le motif du rendez-vous est obligatoire.')
      return
    }

    setError('')
    onSubmit(reason.trim(), details.trim())
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="form-control w-full">
        <span className="label-text font-semibold text-slate-800">Motif du rendez-vous *</span>
        <input
          className="input input-bordered mt-2 w-full bg-white"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ex. Consultation de suivi"
          value={reason}
        />
      </label>
      <label className="form-control w-full">
        <span className="label-text font-semibold text-slate-800">Précision utile (facultatif)</span>
        <textarea
          className="textarea textarea-bordered mt-2 min-h-28 w-full bg-white"
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Ajoutez une courte précision pour le médecin."
          value={details}
        />
      </label>
      {error ? <p className="text-sm font-medium text-error" role="alert">{error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button className="btn btn-ghost" onClick={onBack} type="button">Retour</button>
        <button className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" type="submit">Voir le récapitulatif</button>
      </div>
    </form>
  )
}
