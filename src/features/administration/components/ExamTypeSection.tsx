import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createExamType, getExamTypes, saveExamType, setExamTypeStatus, updateExamType } from '../adminService'
import type { ExamType } from '../types'

const emptyForm = { label: '', description: '' }

export function ExamTypeSection() {
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ExamType | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    getExamTypes()
      .then((loadedExamTypes) => {
        if (active) setExamTypes(loadedExamTypes)
      })
      .catch((loadError: unknown) => {
        if (active) setPageError(loadError instanceof Error ? loadError.message : 'Chargement des examens impossible.')
      })

    return () => {
      active = false
    }
  }, [])

  const filteredExamTypes = useMemo(() => examTypes.filter((examType) => {
    const searchValue = search.trim().toLowerCase()
    return !searchValue || `${examType.label} ${examType.description}`.toLowerCase().includes(searchValue)
  }), [examTypes, search])

  function startCreate() {
    setEditing({ id: '', label: '', description: '', status: 'ACTIF' })
    setForm(emptyForm)
    setError('')
  }

  function startEdit(examType: ExamType) {
    setEditing(examType)
    setForm({ description: examType.description, label: examType.label })
    setError('')
  }

  function closeForm() {
    setEditing(null)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.label.trim() || !form.description.trim()) {
      setError('Le libellé et la description sont obligatoires.')
      return
    }

    const examType: ExamType = {
      id: editing?.id ?? '',
      label: form.label.trim(),
      description: form.description.trim(),
      status: editing?.status ?? 'ACTIF',
    }

    setIsSaving(true)
    try {
      if (editing?.id) {
        await updateExamType(examType)
        setExamTypes((currentTypes) => saveExamType(examType, currentTypes))
      } else {
        const createdExamType = await createExamType({ label: examType.label, description: examType.description })
        setExamTypes((currentTypes) => saveExamType(createdExamType, currentTypes))
      }
      closeForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement de l’examen impossible.')
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleStatus(examType: ExamType) {
    const nextStatus = examType.status === 'ACTIF' ? 'INACTIF' : 'ACTIF'
    const action = nextStatus === 'INACTIF' ? 'désactiver' : 'activer'
    if (!window.confirm(`Voulez-vous vraiment ${action} « ${examType.label} » ?`)) {
      return
    }

    try {
      await setExamTypeStatus(examType.id, nextStatus)
      setExamTypes((currentTypes) => currentTypes.map((item) => item.id === examType.id ? { ...item, status: nextStatus } : item))
      setPageError('')
    } catch (statusError) {
      setPageError(statusError instanceof Error ? statusError.message : 'Modification du statut impossible.')
    }
  }

  return (
    <section className="space-y-5" id="types-examen">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Catalogue médical</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Types d’examen</h2>
        </div>
        <button className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" onClick={startCreate} type="button">Ajouter un type</button>
      </div>

      {pageError ? <p className="text-sm font-medium text-error" role="alert">{pageError}</p> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="input input-bordered flex w-full items-center gap-2 bg-white sm:max-w-md">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Rechercher un type d’examen" onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un examen" value={search} />
        </label>
      </div>

      {editing ? (
        <form className="rounded-xl border border-teal-200 bg-teal-50 p-5 shadow-sm" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-slate-950">{editing.id ? 'Modifier le type d’examen' : 'Ajouter un type d’examen'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={closeForm} type="button">Fermer</button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="form-control"><span className="label-text font-semibold">Libellé *</span><input className="input input-bordered mt-2 bg-white" onChange={(event) => setForm({ ...form, label: event.target.value })} required value={form.label} /></label>
            <label className="form-control"><span className="label-text font-semibold">Description *</span><input className="input input-bordered mt-2 bg-white" onChange={(event) => setForm({ ...form, description: event.target.value })} required value={form.description} /></label>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-error" role="alert">{error}</p> : null}
          <button className="btn btn-primary mt-5 bg-teal-700 text-white hover:bg-teal-800" disabled={isSaving} type="submit">{isSaving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="table">
          <thead><tr><th>Libellé</th><th>Description</th><th>Statut</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {filteredExamTypes.map((examType) => (
              <tr key={examType.id}>
                <td className="font-semibold text-slate-900">{examType.label}</td>
                <td className="max-w-sm text-sm text-slate-600">{examType.description}</td>
                <td><span className={`badge ${examType.status === 'ACTIF' ? 'badge-success' : 'badge-ghost'}`}>{examType.status === 'ACTIF' ? 'Actif' : 'Inactif'}</span></td>
                <td><div className="flex justify-end gap-2"><button className="btn btn-ghost btn-xs text-teal-700" onClick={() => startEdit(examType)} type="button">Modifier</button><button className="btn btn-ghost btn-xs" onClick={() => void toggleStatus(examType)} type="button">{examType.status === 'ACTIF' ? 'Désactiver' : 'Activer'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredExamTypes.length ? <p className="p-6 text-center text-sm text-slate-500">Aucun type d’examen ne correspond à la recherche.</p> : null}
      </div>
    </section>
  )
}
