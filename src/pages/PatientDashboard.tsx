import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { AppointmentInbox } from '../features/appointments/components/AppointmentInbox'
import { useAuth } from '../hooks/useAuth'

const services = [
  {
    title: 'Rendez-vous',
    description: 'Trouvez un service et préparez votre prochaine demande de rendez-vous.',
    label: 'Accéder au service',
  },
  {
    title: 'Dossier patient',
    description: 'Retrouvez les informations de votre suivi dans un espace centralisé.',
    label: 'Consulter mon dossier',
  },
  {
    title: 'Examens',
    description: 'Consultez vos demandes et vos résultats lorsqu’ils sont disponibles.',
    label: 'Voir mes examens',
  },
]

type AssistantMessage = {
  role: 'assistant' | 'user'
  text: string
}

type HealthResponse = {
  response: string
  urgency: 'normal' | 'consultation' | 'urgent'
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function analyzeHealthQuestion(question: string): HealthResponse {
  const text = normalizeText(question)

  if (/difficulte a respirer|ne respire plus|etouffement|douleur thoracique intense|douleur poitrine intense|perte de connaissance|inconscient|convulsion|saignement abondant|hemorragie|paralysie soudaine|faiblesse brutale|confusion soudaine/.test(text)) {
    return {
      urgency: 'urgent',
      response: `Certains signes que vous décrivez peuvent nécessiter une prise en charge médicale immédiate.

Ne restez pas seul et contactez immédiatement les services d'urgence de votre pays ou rendez-vous dans le service d'urgence le plus proche.

En attendant :
• restez avec la personne si elle est en difficulté ;
• évitez de lui faire prendre des médicaments sans avis professionnel ;
• si elle est inconsciente ou ne respire pas normalement, demandez immédiatement une aide d'urgence.

Je ne peux pas déterminer la cause de ces symptômes ni confirmer une urgence médicale.`,
    }
  }

  if (/fievre|temperature elevee|temperature haute|chaud|frissons/.test(text)) {
    return {
      urgency: 'consultation',
      response: `Une température élevée peut accompagner différentes situations, notamment certaines infections. Elle ne permet pas à elle seule de déterminer la cause.

Pour le moment :
• reposez-vous ;
• buvez régulièrement de l'eau pour éviter la déshydratation ;
• surveillez l'évolution de votre température et de vos symptômes ;
• notez depuis quand la fièvre est présente et les autres symptômes associés.

Une consultation médicale est recommandée si la fièvre persiste, s'aggrave ou s'accompagne d'autres symptômes importants.

Consultez rapidement en cas de difficulté à respirer, confusion, perte de connaissance, douleur importante, déshydratation ou aggravation rapide de l'état général.

Je ne peux pas déterminer la cause de votre fièvre ni vous prescrire un traitement.`,
    }
  }

  if (/toux|tousse|toux seche|toux grasse|crachat/.test(text)) {
    return {
      urgency: 'normal',
      response: `Une toux peut avoir plusieurs causes et son origine ne peut pas être déterminée uniquement à partir de ce symptôme.

Vous pouvez :
• boire régulièrement de l'eau ;
• vous reposer ;
• éviter la fumée de cigarette et les environnements irritants ;
• surveiller l'évolution de la toux et l'apparition d'autres symptômes.

Une consultation est recommandée si la toux persiste, devient importante ou s'accompagne de fièvre persistante ou d'une dégradation de votre état général.

En cas de difficulté importante à respirer, de douleur thoracique intense ou de malaise, contactez immédiatement les services d'urgence.`,
    }
  }

  if (/mal de tete|maux de tete|cephalee|migraine|tete qui fait mal/.test(text)) {
    return {
      urgency: 'normal',
      response: `Les maux de tête peuvent avoir différentes causes et leur intensité ou leur contexte sont importants pour déterminer la conduite à tenir.

Si la douleur est légère :
• reposez-vous dans un endroit calme ;
• hydratez-vous correctement ;
• limitez temporairement les écrans et les activités qui aggravent la douleur ;
• observez son évolution.

Une consultation peut être nécessaire si les douleurs sont répétées, inhabituelles, persistantes ou s'aggravent.

Une prise en charge urgente est nécessaire en cas de douleur extrêmement brutale et inhabituelle, de perte de connaissance, de confusion, de faiblesse d'un côté du corps ou de trouble soudain de la parole ou de la vision.

Je ne peux pas déterminer la cause de votre mal de tête à distance.`,
    }
  }

  if (/mal au ventre|douleur abdominale|douleur ventre|douleur estomac|ventre douloureux/.test(text)) {
    return {
      urgency: 'consultation',
      response: `Une douleur abdominale peut avoir de nombreuses causes. Pour mieux orienter la situation, il est important d'observer son emplacement, son intensité, son évolution et les symptômes associés.

En attendant :
• reposez-vous ;
• hydratez-vous régulièrement ;
• surveillez l'évolution de la douleur ;
• notez les symptômes associés, par exemple vomissements, diarrhée ou fièvre.

Une consultation médicale est recommandée si la douleur persiste, revient régulièrement ou devient plus importante.

Consultez rapidement en cas de douleur très intense, de vomissements importants, de saignement, de malaise, de perte de connaissance ou d'aggravation rapide.`,
    }
  }

  if (/nausee|vomissement|vomir|vomit/.test(text)) {
    return {
      urgency: 'normal',
      response: `Les nausées et vomissements peuvent avoir différentes causes.

Pour limiter le risque de déshydratation :
• buvez régulièrement en petites quantités ;
• reposez-vous ;
• reprenez progressivement une alimentation légère lorsque vous pouvez la tolérer ;
• surveillez votre état général.

Une consultation est recommandée si les vomissements persistent ou vous empêchent de boire correctement.

Consultez rapidement en cas de sang dans les vomissements, de forte douleur, de malaise, de confusion ou de signes importants de déshydratation.`,
    }
  }

  if (/fatigue|epuisement|tres fatigue|manque energie/.test(text)) {
    return {
      urgency: 'normal',
      response: `La fatigue peut être liée à de nombreux facteurs, notamment le manque de sommeil, le stress, une période d'activité importante ou certaines situations médicales.

Vous pouvez commencer par :
• privilégier un sommeil régulier ;
• maintenir une hydratation suffisante ;
• avoir une alimentation équilibrée ;
• prévoir des périodes de repos ;
• observer depuis combien de temps la fatigue est présente.

Si la fatigue persiste, s'aggrave ou s'accompagne d'autres symptômes, une consultation médicale permettra d'en rechercher la cause.

Je ne peux pas déterminer l'origine de votre fatigue à partir de ce seul symptôme.`,
    }
  }

  return {
    urgency: 'normal',
    response: `Je peux vous aider à comprendre les informations générales liées à vos symptômes et vous orienter vers la démarche adaptée.

Pour vous répondre plus précisément, indiquez :
• le symptôme que vous ressentez ;
• depuis combien de temps il est présent ;
• son intensité approximative ;
• les autres symptômes éventuels.

Je ne peux toutefois pas établir de diagnostic ni prescrire de traitement.`,
  }
}

function getAssistantReply(question: string) {
  type Intent =
  | 'urgence'
  | 'rendezVous'
  | 'examens'
  | 'dossier'
  | 'notifications'
  | 'symptomes'
  | 'compte'
  | 'inscription'
  | 'aide'
  | 'salutation'
  | 'inconnu'

type IntentConfig = {
  keywords: string[]
  response: string
}

const intents: Record<Intent, IntentConfig> = {

  urgence: {
    keywords: [
      'urgence',
      'urgent',
      'urgente',
      'danger',
      'grave',
      'tres grave',
      'douleur intense',
      'douleur insupportable',
      'douleur tres forte',
      'difficulte a respirer',
      'difficulte pour respirer',
      'ne respire plus',
      'etouffement',
      'etouffe',
      'perte de connaissance',
      'inconscient',
      'convulsion',
      'saignement abondant',
      'hemorragie',
      'accident grave'
    ],

    response:
      'Si vous pensez être face à une urgence médicale, contactez immédiatement les services d’urgence de votre pays ou rendez-vous dans un service d’urgence. Je ne peux pas évaluer ni confirmer une urgence médicale.'
  },

  rendezVous: {
    keywords: [
      'rendez vous',
      'rdv',
      'prendre rendez vous',
      'prendre un rendez vous',
      'reserver',
      'reservation',
      'consultation',
      'consulter',
      'voir un medecin',
      'voir le docteur',
      'medecin',
      'docteur',
      'professionnel de sante',
      'creneau',
      'creneaux',
      'disponibilite',
      'disponible',
      'horaire du medecin',
      'annuler rendez vous',
      'modifier rendez vous',
      'mes rendez vous'
    ],

    response:
      'Pour prendre ou gérer un rendez-vous, ouvrez la rubrique « Rendez-vous ». Vous pourrez consulter les professionnels disponibles, choisir un créneau et suivre l’état de votre demande.'
  },

  examens: {
    keywords: [
      'examen',
      'examens',
      'analyse',
      'analyses',
      'test medical',
      'tests medicaux',
      'bilan',
      'bilan medical',
      'laboratoire',
      'laborantin',
      'resultat',
      'resultats',
      'resultat medical',
      'compte rendu',
      'demande examen',
      'demande d examen'
    ],

    response:
      'La rubrique « Examens » permet de consulter les demandes d’examens et les résultats disponibles. Pour comprendre ou interpréter un résultat médical, demandez conseil à un professionnel de santé.'
  },

  dossier: {
    keywords: [
      'dossier',
      'dossier patient',
      'mon dossier',
      'suivi medical',
      'suivi patient',
      'historique medical',
      'historique',
      'antecedents',
      'informations medicales',
      'mes consultations',
      'ancienne consultation',
      'ordonnance',
      'ordonnances',
      'prescription',
      'prescriptions',
      'document medical',
      'documents medicaux',
      'compte rendu'
    ],

    response:
      'Vous pouvez consulter vos informations de suivi dans la rubrique « Dossier patient ». Les informations accessibles dépendent de vos droits. Pour toute question concernant un document médical, adressez-vous à votre centre de santé.'
  },

  notifications: {
    keywords: [
      'notification',
      'notifications',
      'message',
      'messages',
      'alerte',
      'alertes',
      'rappel',
      'rappels',
      'confirmation',
      'confirmer',
      'nouveau message',
      'message recu'
    ],

    response:
      'Vos notifications sont accessibles depuis votre espace personnel. Elles peuvent notamment vous informer de la confirmation d’un rendez-vous, de la disponibilité d’un résultat d’examen ou d’un événement concernant votre suivi.'
  },

  symptomes: {
    keywords: [
      'symptome',
      'symptomes',
      'j ai mal',
      'jai mal',
      'douleur',
      'fievre',
      'toux',
      'rhume',
      'migraine',
      'mal de tete',
      'maux de tete',
      'vomissement',
      'vomir',
      'nausee',
      'diarrhee',
      'vertige',
      'fatigue',
      'courbature',
      'mal au ventre',
      'douleur abdominale',
      'mal a la gorge',
      'gorge irritee',
      'nez bouche',
      'nez qui coule',
      'palpitations',
      'essoufflement'
    ],

    response:
      'Je peux vous fournir des informations générales sur certains symptômes et vous orienter vers une consultation lorsque cela est nécessaire. Je ne peux toutefois pas établir de diagnostic ni prescrire de traitement.'
  },

  compte: {
    keywords: [
      'connexion',
      'connecter',
      'se connecter',
      'login',
      'mot de passe',
      'mot passe',
      'password',
      'oublie mot de passe',
      'changer mot de passe',
      'modifier mot de passe',
      'compte',
      'profil',
      'mon profil',
      'mes informations'
    ],

    response:
      'Pour gérer votre compte, ouvrez votre profil. Vous pourrez consulter ou modifier les informations autorisées. En cas de problème de connexion ou de mot de passe, utilisez les options disponibles sur la page de connexion.'
  },

  inscription: {
    keywords: [
      'inscription',
      'inscrire',
      's inscrire',
      'creer un compte',
      'creation compte',
      'nouveau compte',
      'ouvrir un compte',
      'enregistrer',
      'devenir patient'
    ],

    response:
      'Pour créer un compte patient, utilisez la rubrique d’inscription et renseignez les informations demandées. Une fois votre compte créé, vous pourrez accéder aux services proposés par la plateforme.'
  },

  aide: {
    keywords: [
      'aide',
      'aidez moi',
      'help',
      'que peux tu faire',
      'que pouvez vous faire',
      'comment ca marche',
      'comment utiliser',
      'comment fonctionne',
      'besoin aide',
      'information',
      'informations'
    ],

    response:
      'Je peux vous aider à vous orienter dans la plateforme : rendez-vous, consultations, dossier patient, examens, résultats, notifications et informations générales de santé.'
  },

  salutation: {
    keywords: [
      'bonjour',
      'bonsoir',
      'salut',
      'hello',
      'coucou',
      'bon matin',
      'bonne journee'
    ],

    response:
      'Bonjour ! Je suis l’Assistant Santé. Je peux vous aider avec les rendez-vous, le dossier patient, les examens, les notifications et les informations générales de santé. Que souhaitez-vous faire ?'
  },

  inconnu: {
    keywords: [],

    response:
      'Je peux vous aider à vous orienter dans la plateforme. Vous pouvez me poser une question concernant les rendez-vous, les consultations, le dossier patient, les examens, les résultats ou les notifications.'
  }
}

const normalizedQuestion = normalizeText(question)
const healthResponse = analyzeHealthQuestion(question)

if (healthResponse.urgency === 'urgent') return healthResponse.response

const matchingIntent = Object.entries(intents).find(([intentName, intent]) =>
  intentName !== 'symptomes' && intent.keywords.some((keyword) => normalizedQuestion.includes(keyword)),
)

if (matchingIntent) return matchingIntent[1].response

const hasSymptom = intents.symptomes.keywords.some((keyword) => normalizedQuestion.includes(keyword))
return hasSymptom ? healthResponse.response : intents.inconnu.response
}

export function PatientDashboard() {
  const { user } = useAuth()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: 'assistant', text: 'Bonjour ! Je peux vous orienter vers les services du centre. Que recherchez-vous ?' },
  ])

  function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) return

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedQuestion },
      { role: 'assistant', text: getAssistantReply(trimmedQuestion) },
    ])
    setQuestion('')
    setAssistantOpen(true)
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-teal-900 px-6 py-12 text-white shadow-xl shadow-teal-950/10 sm:px-10 lg:px-14">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">
            Votre espace patient
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Bonjour {user?.name}, prenez soin de votre santé simplement.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-teal-100 sm:text-lg">
            Accédez aux services du centre de santé depuis un même espace, avec un accompagnement clair à chaque étape.
          </p>
          <Link
            className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
            to="/services"
          >
            Découvrir nos services
          </Link>
        </div>
        <div className="absolute -right-16 -top-20 size-72 rounded-full border-[28px] border-teal-800/60" />
        <div className="absolute -bottom-32 right-24 size-64 rounded-full border-[20px] border-teal-700/60" />
      </section>

      <section id="services" className="scroll-mt-28">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              À votre disposition
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Les services proposés
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            Les fonctionnalités seront ajoutées progressivement selon le parcours de la plateforme.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
              key={service.title}
            >
              <div className="grid size-11 place-items-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
                +
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{service.title}</h3>
              <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">{service.description}</p>
              <Link
                className="mt-5 inline-flex text-sm font-semibold text-teal-700 transition group-hover:text-teal-900"
                to="/services"
              >
                {service.label} <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="assistant" className="scroll-mt-28 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
              Besoin d’orientation ?
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Assistant Santé</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Un outil d’information et d’orientation générale. Il ne pose pas de diagnostic et ne remplace pas un professionnel de santé.
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            {assistantOpen && (
              <div
                aria-label="Conversation avec l’Assistant Santé"
                className="absolute bottom-[calc(100%+0.75rem)] right-0 z-20 flex max-h-[min(28rem,65vh)] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl"
                role="dialog"
                aria-modal="false"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="font-semibold text-slate-900">Assistant Santé</p>
                  <button
                    aria-label="Fermer la messagerie"
                    className="grid size-8 place-items-center rounded-md text-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setAssistantOpen(false)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                <div aria-live="polite" className="flex min-h-32 flex-col gap-3 overflow-y-auto p-4">
                  {messages.map((message, index) => (
                    <p
                      className={`max-w-[90%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-5 ${
                        message.role === 'user'
                          ? 'self-end bg-teal-800 text-white'
                          : 'self-start bg-slate-100 text-slate-800'
                      }`}
                      key={`${message.role}-${index}`}
                    >
                      {message.text}
                    </p>
                  ))}
                </div>
                <p className="border-t border-slate-100 px-4 py-2 text-xs leading-5 text-slate-500">
                  Assistant automatique d’orientation, sans diagnostic médical.
                </p>
              </div>
            )}
            <form className="flex gap-2" onSubmit={sendQuestion}>
              <label className="min-w-0 flex-1">
                <span className="sr-only">Question à poser à l’Assistant Santé</span>
                <input
                  aria-label="Question à poser à l’Assistant Santé"
                  className="input input-info w-full bg-white text-sm text-slate-900 placeholder:text-slate-400"
                  onChange={(event) => setQuestion(event.target.value)}
                  onClick={() => setAssistantOpen(true)}
                  onFocus={() => setAssistantOpen(true)}
                  placeholder="Écrivez votre question…"
                  type="text"
                  value={question}
                />
              </label>
              <button
                aria-label="Envoyer la question"
                className="shrink-0 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white transition hover:bg-teal-900"
                type="submit"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      <AppointmentInbox audience="patient" />
    </div>
  )
}
