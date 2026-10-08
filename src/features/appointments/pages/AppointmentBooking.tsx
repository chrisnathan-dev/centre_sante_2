import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAppointment, getAppointmentSlots, getAvailableDoctors, getReservedSlots } from '../appointmentService'
import { AppointmentForm } from '../components/AppointmentForm'
import { AppointmentInbox } from '../components/AppointmentInbox'
import { AppointmentStepper } from '../components/AppointmentStepper'
import { AppointmentSummary } from '../components/AppointmentSummary'
import { DoctorCard } from '../components/DoctorCard'
import { ServiceCard } from '../components/ServiceCard'
import { TimeSlot } from '../components/TimeSlot'
import { appointmentServices } from '../mockData'
import type { Appointment, AppointmentService, AppointmentSlot, Doctor } from '../types'

const stepTitles = [
  'Choisissez un service',
  'Choisissez un médecin',
  'Choisissez un créneau',
  'Informations du rendez-vous',
  'Récapitulatif',
]

export function AppointmentBooking() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<AppointmentService | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [submissionError, setSubmissionError] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [reservedSlots, setReservedSlots] = useState<Array<{ date: string; time: string }>>([])
  const [doctorLoadError, setDoctorLoadError] = useState('')
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    getAvailableDoctors()
      .then((availableDoctors) => {
        if (active) setDoctors(availableDoctors)
      })
      .catch((error: unknown) => {
        if (active) setDoctorLoadError(error instanceof Error ? error.message : 'Chargement des médecins impossible.')
      })
      .finally(() => {
        if (active) setIsLoadingDoctors(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedDoctor) {
      setReservedSlots([])
      return
    }

    let active = true
    setIsLoadingSlots(true)
    getReservedSlots(selectedDoctor.id)
      .then((slots) => {
        if (active) setReservedSlots(slots)
      })
      .catch((error: unknown) => {
        if (active) setDoctorLoadError(error instanceof Error ? error.message : 'Chargement des disponibilités impossible.')
      })
      .finally(() => {
        if (active) setIsLoadingSlots(false)
      })

    return () => {
      active = false
    }
  }, [selectedDoctor])

  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.serviceId === selectedService?.id),
    [doctors, selectedService],
  )
  const availableSlots = getAppointmentSlots().map((slot) => ({
    ...slot,
    available: slot.available && !reservedSlots.some((reserved) => reserved.date === slot.date && reserved.time === slot.time),
  }))
  const slotsByDate = availableSlots.reduce<Record<string, AppointmentSlot[]>>((groups, slot) => {
    groups[slot.date] = [...(groups[slot.date] ?? []), slot]
    return groups
  }, {})

  function selectService(service: AppointmentService) {
    setSelectedService(service)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setSubmissionError('')
  }

  function selectDoctor(doctor: Doctor) {
    setSelectedDoctor(doctor)
    setSelectedSlot(null)
    setSubmissionError('')
  }

  function goToDoctorStep() {
    if (selectedService) {
      setStep(2)
    }
  }

  function goToSlotStep() {
    if (selectedDoctor) {
      setStep(3)
    }
  }

  function goToFormStep() {
    if (selectedSlot) {
      setStep(4)
    }
  }

  function goBack() {
    setSubmissionError('')
    setStep((currentStep) => Math.max(1, currentStep - 1))
  }

  function showSummary(formReason: string, formDetails: string) {
    setReason(formReason)
    setDetails(formDetails)
    setStep(5)
  }

  async function confirmAppointment() {
    if (!selectedService || !selectedDoctor || !selectedSlot) {
      return
    }

    setIsSubmitting(true)
    try {
      const createdAppointment = await createAppointment({
        service: selectedService,
        doctor: selectedDoctor,
        slot: selectedSlot,
        reason,
        details,
      })
      setAppointment(createdAppointment)
      setSubmissionError('')
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'La demande n’a pas pu être enregistrée.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function restartBooking() {
    setStep(1)
    setSelectedService(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setReason('')
    setDetails('')
    setAppointment(null)
    setSubmissionError('')
  }

  if (appointment) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <AppointmentStepper currentStep={5} />
        <section className="card border border-emerald-200 bg-emerald-50 shadow-sm">
          <div className="card-body items-center p-6 text-center sm:p-10">
            <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Demande transmise</p>
            <h1 className="card-title mt-2 text-2xl text-slate-950 sm:text-3xl">Votre demande a été envoyée à {appointment.doctor.name}.</h1>
            <div className="mt-6 grid w-full gap-3 text-left sm:grid-cols-2">
              <SummaryItem label="Médecin" value={appointment.doctor.name} />
              <SummaryItem label="Service" value={appointment.service.name} />
              <SummaryItem label="Date" value={appointment.slot.dateLabel} />
              <SummaryItem label="Heure" value={appointment.slot.time} />
            </div>
            <div className="badge badge-warning mt-6 px-4 py-3">Statut : En attente de réponse du médecin</div>
            <div className="card-actions mt-8 flex-col-reverse sm:flex-row">
              <Link className="btn btn-ghost" to="/tableau-de-bord/patient">Retour à mon espace</Link>
              <button className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" onClick={restartBooking} type="button">Faire une autre demande</button>
            </div>
          </div>
        </section>
        <AppointmentInbox audience="patient" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-teal-700 hover:text-teal-900" to="/services">← Retour aux services</Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Prise de rendez-vous</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Organisons votre prochaine consultation.</h1>
        </div>
        <button className="btn btn-ghost btn-sm self-start" onClick={restartBooking} type="button">Annuler</button>
      </div>

      <AppointmentStepper currentStep={step} />

      <section className="card border border-slate-200 bg-white shadow-sm">
        <div className="card-body gap-6 p-5 sm:p-8">
          <div>
            <h2 className="card-title text-2xl text-slate-950">{stepTitles[step - 1]}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {step === 1 && 'Sélectionnez le service médical qui correspond à votre besoin.'}
              {step === 2 && 'Seuls les médecins associés au service choisi sont affichés.'}
              {step === 3 && 'Les créneaux déjà réservés sont désactivés.'}
              {step === 4 && 'Les informations choisies sont conservées pour votre demande.'}
              {step === 5 && 'Vérifiez les informations avant de confirmer votre demande.'}
            </p>
          </div>

          {step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {appointmentServices.map((service) => (
                  <ServiceCard key={service.id} onSelect={() => selectService(service)} selected={selectedService?.id === service.id} service={service} />
                ))}
              </div>
              <StepActions backLabel="Retour" continueLabel="Continuer" disableContinue={!selectedService} onBack={() => undefined} onContinue={goToDoctorStep} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="rounded-lg bg-teal-50 p-4 text-sm text-teal-900">Service sélectionné : <strong>{selectedService?.name}</strong></div>
              {doctorLoadError ? <p className="text-sm font-medium text-error" role="alert">{doctorLoadError}</p> : null}
              {isLoadingDoctors ? <p className="text-sm text-slate-600">Chargement des médecins…</p> : null}
              <div className="grid gap-4">
                {availableDoctors.length ? availableDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} onSelect={() => selectDoctor(doctor)} selected={selectedDoctor?.id === doctor.id} />
                )) : <EmptyState message="Aucun médecin n’est actuellement associé à ce service." />}
              </div>
              <StepActions backLabel="Retour" continueLabel="Continuer" disableContinue={!selectedDoctor} onBack={goBack} onContinue={goToSlotStep} />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <SelectionBanner doctor={selectedDoctor} service={selectedService} />
              {isLoadingSlots ? <p className="text-sm text-slate-600">Chargement des créneaux réservés…</p> : null}
              {doctorLoadError ? <p className="text-sm font-medium text-error" role="alert">{doctorLoadError}</p> : null}
              <div className="space-y-5">
                {Object.entries(slotsByDate).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="text-base font-semibold text-slate-950">{slots[0].dateLabel}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slots.map((slot) => <TimeSlot key={slot.id} onSelect={() => setSelectedSlot(slot)} selected={selectedSlot?.id === slot.id} slot={slot} />)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Les créneaux grisés ne sont pas disponibles.</p>
              <StepActions backLabel="Retour" continueLabel="Continuer" disableContinue={!selectedSlot} onBack={goBack} onContinue={goToFormStep} />
            </>
          ) : null}

          {step === 4 && selectedService && selectedDoctor && selectedSlot ? (
            <>
              <SelectionBanner doctor={selectedDoctor} service={selectedService} slot={selectedSlot} />
              <AppointmentForm initialDetails={details} initialReason={reason} onBack={goBack} onSubmit={showSummary} />
            </>
          ) : null}

          {step === 5 && selectedService && selectedDoctor && selectedSlot ? (
            <AppointmentSummary
              error={submissionError}
              isSubmitting={isSubmitting}
              onConfirm={confirmAppointment}
              onEdit={() => setStep(4)}
              request={{ details, doctor: selectedDoctor, reason, service: selectedService, slot: selectedSlot }}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}

function StepActions({ backLabel, continueLabel, disableContinue, onBack, onContinue }: { backLabel: string; continueLabel: string; disableContinue: boolean; onBack: () => void; onContinue: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
      <button className="btn btn-ghost" onClick={onBack} type="button">{backLabel}</button>
      <button className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" disabled={disableContinue} onClick={onContinue} type="button">{continueLabel}</button>
    </div>
  )
}

function SelectionBanner({ doctor, service, slot }: { doctor: Doctor | null; service: AppointmentService | null; slot?: AppointmentSlot }) {
  return (
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
      <SummaryItem label="Service" value={service?.name ?? ''} />
      <SummaryItem label="Médecin" value={doctor?.name ?? ''} />
      {slot ? <SummaryItem label="Créneau" value={`${slot.dateLabel} à ${slot.time}`} /> : null}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>
}

function EmptyState({ message }: { message: string }) {
  return <div className="alert border border-slate-200 bg-slate-50 text-sm text-slate-600">{message}</div>
}
