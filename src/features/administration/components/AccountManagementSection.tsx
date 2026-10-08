import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createAdminAccount, getAdminAccounts, saveAccount, setAdminAccountStatus, updateAdminAccount } from '../adminService'
import type { AccountRole, AccountStatus, AdminAccount, StaffType } from '../types'

type AccountRoleFilter = AccountRole | 'TOUS'
type AccountForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  registrationNumber: string
  specialty: string
  service: string
  functionTitle: string
  staffType: StaffType
  password: string
}

const emptyForm: AccountForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  registrationNumber: '',
  specialty: '',
  service: '',
  functionTitle: '',
  staffType: 'GENERAL',
  password: '',
}

const roleLabels: Record<AccountRole, string> = {
  PATIENT: 'Patient',
  MEDECIN: 'Médecin',
  PERSONNEL: 'Personnel',
}

export function AccountManagementSection() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AccountRoleFilter>('TOUS')
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'TOUS'>('TOUS')
  const [formOpen, setFormOpen] = useState(false)
  const [accountRole, setAccountRole] = useState<'MEDECIN' | 'PERSONNEL'>('MEDECIN')
  const [editing, setEditing] = useState<AdminAccount | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    getAdminAccounts()
      .then((loadedAccounts) => {
        if (active) setAccounts(loadedAccounts)
      })
      .catch((loadError: unknown) => {
        if (active) setPageError(loadError instanceof Error ? loadError.message : 'Chargement des comptes impossible.')
      })

    return () => {
      active = false
    }
  }, [])

  const filteredAccounts = useMemo(() => accounts.filter((account) => {
    const searchValue = search.trim().toLowerCase()
    const matchesSearch = !searchValue || `${account.firstName} ${account.lastName} ${account.email} ${account.phone}`.toLowerCase().includes(searchValue)
    const matchesRole = roleFilter === 'TOUS' || account.role === roleFilter
    const matchesStatus = statusFilter === 'TOUS' || account.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  }), [accounts, roleFilter, search, statusFilter])

  function openCreate(role: 'MEDECIN' | 'PERSONNEL') {
    setAccountRole(role)
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setFormOpen(true)
  }

  function openEdit(account: AdminAccount) {
    if (account.role === 'PATIENT') {
      return
    }
    setAccountRole(account.role)
    setEditing(account)
    setForm({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phone: account.phone,
      registrationNumber: account.registrationNumber ?? '',
      specialty: account.specialty ?? '',
      service: account.service ?? '',
      functionTitle: account.functionTitle ?? '',
      staffType: account.staffType ?? 'GENERAL',
      password: '',
    })
    setError('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missingBaseField = !form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()
    const missingDoctorField = accountRole === 'MEDECIN' && (!form.registrationNumber.trim() || !form.specialty.trim() || !form.service.trim())
    const missingStaffField = accountRole === 'PERSONNEL' && !form.functionTitle.trim()

    if (missingBaseField || missingDoctorField || missingStaffField) {
      setError('Veuillez renseigner tous les champs obligatoires.')
      return
    }

    if (!editing && form.password.length < 8) {
      setError('Le mot de passe initial doit contenir au moins 8 caractères.')
      return
    }

    const account: AdminAccount = {
      id: editing?.id ?? `account-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: accountRole,
      status: editing?.status ?? 'ACTIF',
      createdAt: editing?.createdAt ?? new Date().toISOString().slice(0, 10),
      registrationNumber: accountRole === 'MEDECIN' ? form.registrationNumber.trim() : undefined,
      specialty: accountRole === 'MEDECIN' ? form.specialty.trim() : undefined,
      service: accountRole === 'MEDECIN' ? form.service.trim() : undefined,
      functionTitle: accountRole === 'PERSONNEL' ? form.functionTitle.trim() : undefined,
      staffType: accountRole === 'PERSONNEL' ? form.staffType : undefined,
    }

    setIsSaving(true)
    try {
      if (editing) {
        await updateAdminAccount(account)
      } else {
        const createdAccount = await createAdminAccount({
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          phone: account.phone,
          role: account.role,
          registrationNumber: account.registrationNumber,
          specialty: account.specialty,
          service: account.service,
          functionTitle: account.functionTitle,
          staffType: account.staffType,
          password: form.password,
        })
        setAccounts((currentAccounts) => saveAccount(createdAccount, currentAccounts))
      }

      if (editing) setAccounts((currentAccounts) => saveAccount(account, currentAccounts))
      closeForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement du compte impossible.')
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleStatus(account: AdminAccount) {
    const nextStatus = account.status === 'ACTIF' ? 'INACTIF' : 'ACTIF'
    const action = nextStatus === 'INACTIF' ? 'désactiver' : 'activer'
    if (!window.confirm(`Voulez-vous vraiment ${action} le compte de ${account.firstName} ${account.lastName} ?`)) {
      return
    }

    try {
      await setAdminAccountStatus(account.id, nextStatus)
      setAccounts((currentAccounts) => currentAccounts.map((item) => item.id === account.id ? { ...item, status: nextStatus } : item))
      setPageError('')
    } catch (statusError) {
      setPageError(statusError instanceof Error ? statusError.message : 'Modification du statut impossible.')
    }
  }

  return (
    <section className="space-y-5" id="comptes">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Accès plateforme</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Comptes utilisateurs</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline btn-sm border-teal-700 text-teal-800 hover:bg-teal-700 hover:text-white" onClick={() => openCreate('MEDECIN')} type="button">+ Médecin</button>
          <button className="btn btn-primary btn-sm bg-teal-700 text-white hover:bg-teal-800" onClick={() => openCreate('PERSONNEL')} type="button">+ Personnel</button>
        </div>
      </div>

      {pageError ? <p className="text-sm font-medium text-error" role="alert">{pageError}</p> : null}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label className="input input-bordered flex items-center gap-2 bg-white"><span aria-hidden="true">⌕</span><input aria-label="Rechercher un compte" onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un nom, email..." value={search} /></label>
        <select aria-label="Filtrer par rôle" className="select select-bordered bg-white" onChange={(event) => setRoleFilter(event.target.value as AccountRoleFilter)} value={roleFilter}><option value="TOUS">Tous les rôles</option><option value="PATIENT">Patients</option><option value="MEDECIN">Médecins</option><option value="PERSONNEL">Personnel</option></select>
        <select aria-label="Filtrer par statut" className="select select-bordered bg-white" onChange={(event) => setStatusFilter(event.target.value as AccountStatus | 'TOUS')} value={statusFilter}><option value="TOUS">Tous les statuts</option><option value="ACTIF">Actifs</option><option value="INACTIF">Inactifs</option></select>
      </div>

      {formOpen ? <AccountForm accountRole={accountRole} editing={editing} error={error} form={form} isSaving={isSaving} onClose={closeForm} onChange={setForm} onSubmit={handleSubmit} /> : null}

      {selectedAccount ? (
        <div className="alert border border-teal-200 bg-teal-50 text-slate-700">
          <div><p className="font-semibold text-slate-900">Compte sélectionné : {selectedAccount.firstName} {selectedAccount.lastName}</p><p className="text-sm">{selectedAccount.email} · {selectedAccount.phone} · Créé le {selectedAccount.createdAt}</p></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedAccount(null)} type="button">Fermer</button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="table">
          <thead><tr><th>Nom</th><th>Rôle</th><th>Contact</th><th>Statut</th><th>Créé le</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td><p className="font-semibold text-slate-900">{account.firstName} {account.lastName}</p><p className="text-xs text-slate-500">{account.email}</p></td>
                <td><span className="badge badge-ghost">{roleLabels[account.role]}{account.staffType ? ` · ${account.staffType}` : ''}</span></td>
                <td className="text-sm text-slate-600">{account.phone}</td>
                <td><span className={`badge ${account.status === 'ACTIF' ? 'badge-success' : 'badge-ghost'}`}>{account.status === 'ACTIF' ? 'Actif' : 'Inactif'}</span></td>
                <td className="text-sm text-slate-600">{account.createdAt}</td>
                <td><div className="flex justify-end gap-1"><button className="btn btn-ghost btn-xs text-teal-700" onClick={() => setSelectedAccount(account)} type="button">Voir</button>{account.role !== 'PATIENT' ? <button className="btn btn-ghost btn-xs" onClick={() => openEdit(account)} type="button">Modifier</button> : null}<button className="btn btn-ghost btn-xs" onClick={() => void toggleStatus(account)} type="button">{account.status === 'ACTIF' ? 'Désactiver' : 'Activer'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredAccounts.length ? <p className="p-6 text-center text-sm text-slate-500">Aucun compte ne correspond aux filtres.</p> : null}
      </div>
    </section>
  )
}

function AccountForm({ accountRole, editing, error, form, isSaving, onChange, onClose, onSubmit }: { accountRole: 'MEDECIN' | 'PERSONNEL'; editing: AdminAccount | null; error: string; form: AccountForm; isSaving: boolean; onChange: (form: AccountForm) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="rounded-xl border border-teal-200 bg-teal-50 p-5 shadow-sm" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-4"><h3 className="text-xl font-semibold text-slate-950">{editing ? 'Modifier le compte' : `Créer un compte ${accountRole === 'MEDECIN' ? 'médecin' : 'personnel'}`}</h3><button className="btn btn-ghost btn-sm" onClick={onClose} type="button">Fermer</button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormInput label="Nom *" value={form.lastName} onChange={(value) => onChange({ ...form, lastName: value })} />
        <FormInput label="Prénom *" value={form.firstName} onChange={(value) => onChange({ ...form, firstName: value })} />
        <FormInput label="Email *" type="email" value={form.email} onChange={(value) => onChange({ ...form, email: value })} />
        <FormInput label="Téléphone *" value={form.phone} onChange={(value) => onChange({ ...form, phone: value })} />
        {!editing ? <label className="form-control"><span className="label-text font-semibold">Mot de passe initial *</span><input autoComplete="new-password" className="input input-bordered mt-2 bg-white" minLength={8} onChange={(event) => onChange({ ...form, password: event.target.value })} required type="password" value={form.password} /></label> : null}
        {accountRole === 'MEDECIN' ? <><FormInput label="Matricule *" value={form.registrationNumber} onChange={(value) => onChange({ ...form, registrationNumber: value })} /><FormInput label="Spécialité *" value={form.specialty} onChange={(value) => onChange({ ...form, specialty: value })} /><FormInput label="Service *" value={form.service} onChange={(value) => onChange({ ...form, service: value })} /></> : <><FormInput label="Fonction *" value={form.functionTitle} onChange={(value) => onChange({ ...form, functionTitle: value })} /><label className="form-control"><span className="label-text font-semibold">Type de rôle *</span><select className="select select-bordered mt-2 bg-white" onChange={(event) => onChange({ ...form, staffType: event.target.value as StaffType })} value={form.staffType}><option value="GENERAL">Général</option><option value="LABORANTIN">Laborantin</option></select></label></>}
      </div>
      <p className="mt-4 text-xs text-slate-600">Le mot de passe initial doit être communiqué au nouvel utilisateur de manière sécurisée.</p>
      {error ? <p className="mt-3 text-sm font-medium text-error" role="alert">{error}</p> : null}
      <button className="btn btn-primary mt-5 bg-teal-700 text-white hover:bg-teal-800" disabled={isSaving} type="submit">{isSaving ? 'Enregistrement…' : 'Enregistrer le compte'}</button>
    </form>
  )
}

function FormInput({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-control"><span className="label-text font-semibold">{label}</span><input className="input input-bordered mt-2 bg-white" onChange={(event) => onChange(event.target.value)} type={type} value={value} /></label>
}
