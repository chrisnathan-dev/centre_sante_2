const steps = ['Service', 'Médecin', 'Créneau', 'Informations', 'Confirmation']

type AppointmentStepperProps = {
  currentStep: number
}

export function AppointmentStepper({ currentStep }: AppointmentStepperProps) {
  return (
    <ul className="steps steps-vertical w-full sm:steps-horizontal">
      {steps.map((step, index) => (
        <li className={`step ${index + 1 <= currentStep ? 'step-primary' : ''}`} key={step}>
          <span className="text-xs font-medium sm:text-sm">{step}</span>
        </li>
      ))}
    </ul>
  )
}
