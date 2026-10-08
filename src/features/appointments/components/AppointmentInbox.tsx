import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { getAppointmentMessages, getMyAppointments, sendAppointmentMessage } from '../appointmentService'
import type { AppointmentMessage, StoredAppointment } from '../types'

type AppointmentInboxProps = {
  audience: 'patient' | 'doctor'
}

const statusLabels: Record<StoredAppointment['status'], string> = {
  EN_ATTENTE: 'En attente de réponse',
  CONFIRME: 'Confirmé',
  REFUSE: 'Refusé',
  ANNULE: 'Annulé',
}

export function AppointmentInbox({ audience }: AppointmentInboxProps) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<StoredAppointment[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AppointmentMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let active = true
    getMyAppointments()
      .then((loadedAppointments) => {
        if (!active) return
        setAppointments(loadedAppointments)
        setSelectedId((currentId) => currentId && loadedAppointments.some((item) => item.id === currentId)
          ? currentId
          : loadedAppointments[0]?.id ?? null)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Chargement des rendez-vous impossible.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    let active = true
    getAppointmentMessages(selectedId)
      .then((loadedMessages) => {
        if (active) setMessages(loadedMessages)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Chargement de la conversation impossible.')
      })

    return () => {
      active = false
    }
  }, [selectedId])

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()
    if (!selectedId || !message) return

    setError('')
    setIsSending(true)
    try {
      await sendAppointmentMessage(selectedId, message)
      setMessages(await getAppointmentMessages(selectedId))
      setDraft('')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Envoi du message impossible.')
    } finally {
      setIsSending(false)
    }
  }

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedId)
  const title = audience === 'doctor' ? 'Rendez-vous reçus' : 'Mes rendez-vous et échanges'

  return (
    <section className="space-y-4" aria-labelledby="appointment-inbox-title">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          {audience === 'doctor' ? 'Demandes des patients' : 'Suivi patient'}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950" id="appointment-inbox-title">{title}</h2>
      </div>

      {error ? <p className="text-sm font-medium text-error" role="alert">{error}</p> : null}
      {isLoading ? <p className="text-sm text-slate-600">Chargement des rendez-vous…</p> : null}
      {!isLoading && appointments.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {audience === 'doctor' ? 'Aucune demande ne vous a encore été transmise.' : 'Vous n’avez pas encore de rendez-vous.'}
        </p>
      ) : null}

      {appointments.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-2" aria-label="Liste des rendez-vous">
            {appointments.map((appointment) => {
              const counterpart = audience === 'doctor' ? appointment.patientName : appointment.doctorName
              const dateLabel = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
                new Date(`${appointment.date}T12:00:00`),
              )

              return (
                <button
                  aria-pressed={selectedId === appointment.id}
                  className={`w-full rounded-lg border p-4 text-left transition ${selectedId === appointment.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'}`}
                  key={appointment.id}
                  onClick={() => setSelectedId(appointment.id)}
                  type="button"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-slate-950">{counterpart}</span>
                    <span className="badge badge-sm badge-outline">{statusLabels[appointment.status]}</span>
                  </span>
                  <span className="mt-2 block text-sm text-slate-600">{appointment.serviceName}</span>
                  <span className="mt-1 block text-sm text-slate-500">{dateLabel} à {appointment.time}</span>
                </button>
              )
            })}
          </div>

          {selectedAppointment ? (
            <div className="flex min-h-80 flex-col rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-4">
                <h3 className="font-semibold text-slate-950">{selectedAppointment.reason}</h3>
                {selectedAppointment.details ? <p className="mt-2 text-sm leading-6 text-slate-600">{selectedAppointment.details}</p> : null}
                <p className="mt-2 text-xs text-slate-500">
                  {audience === 'doctor' ? `Patient : ${selectedAppointment.patientName}` : `Médecin : ${selectedAppointment.doctorName}`}
                </p>
              </div>

              <div aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messages.length ? messages.map((message) => {
                  const isOwnMessage = message.senderRole === user?.role
                  return (
                    <div className={`max-w-[90%] rounded-lg px-3 py-2 ${isOwnMessage ? 'self-end bg-teal-800 text-white' : 'self-start bg-slate-100 text-slate-800'}`} key={message.id}>
                      <p className="text-xs font-semibold">{message.senderName}</p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-5">{message.message}</p>
                    </div>
                  )
                }) : <p className="text-sm text-slate-500">Aucun message dans cette conversation.</p>}
              </div>

              <form className="flex gap-2 border-t border-slate-200 p-3" onSubmit={submitMessage}>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Votre réponse</span>
                  <input
                    aria-label="Votre réponse"
                    className="input input-bordered w-full bg-white"
                    maxLength={5000}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Écrire une réponse…"
                    value={draft}
                  />
                </label>
                <button className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" disabled={isSending || !draft.trim()} type="submit">
                  {isSending ? 'Envoi…' : 'Répondre'}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}