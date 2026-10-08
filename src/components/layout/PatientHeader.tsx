import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const serviceLinks = [
    { label: 'Prendre rendez-vous', href: '/services#demande-rendez-vous' },
    { label: 'Mon dossier patient', href: '/services' },
    { label: 'Mes examens', href: '/services#examens' },
]

export function PatientHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isServicesOpen, setIsServicesOpen] = useState(false)
    const { user, logout } = useAuth()

    function closeMenu() {
        setIsMenuOpen(false)
        setIsServicesOpen(false)
    }

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                <Link className="flex items-center gap-2.5" onClick={closeMenu} to="/">
                    <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-sm font-bold text-white">
                        CS
                    </span>
                    <span className="text-base font-bold tracking-tight text-slate-950">
                        Centre<span className="text-teal-700">Soin</span>
                    </span>
                </Link>

                <button
                    aria-expanded={isMenuOpen}
                    aria-label="Ouvrir le menu"
                    className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    type="button"
                >
                    <span className="text-xl leading-none">{isMenuOpen ? '×' : '☰'}</span>
                </button>

                <nav
                    className={`${isMenuOpen ? 'flex' : 'hidden'
                        } absolute left-0 right-0 top-full flex-col gap-2 border-b border-slate-200 bg-white p-4 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
                >
                    <NavLink
                        className={({ isActive }) =>
                            `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                                ? 'bg-teal-50 text-teal-800'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                            }`
                        }
                        onClick={closeMenu}
                        to="/tableau-de-bord/patient"
                    >
                        Accueil
                    </NavLink>

                    <div className="relative">
                        <button
                            aria-expanded={isServicesOpen}
                            className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 lg:w-auto"
                            onClick={() => setIsServicesOpen((open) => !open)}
                            type="button"
                        >
                            Services proposés
                            <span className={`text-xs transition ${isServicesOpen ? 'rotate-180' : ''}`}>
                                ▾
                            </span>
                        </button>
                        {isServicesOpen ? (
                            <div className="mt-1 space-y-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg lg:absolute lg:left-0 lg:top-full lg:mt-2 lg:w-56">
                                {serviceLinks.map((service) => (
                                    <Link
                                        className="btn btn-ghost btn-sm w-full justify-start text-sm font-normal text-slate-600"
                                        key={service.label}
                                        onClick={closeMenu}
                                        to={service.href}
                                    >
                                        {service.label}
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <a
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                        href="#assistant"
                        onClick={closeMenu}
                    >
                        Assistant Santé
                    </a>

                    <div className="mt-2 flex items-center gap-3 border-t border-slate-100 pt-3 lg:mt-0 lg:border-0 lg:pt-0">
                        <span className="hidden text-sm text-slate-500 xl:inline">Bonjour, {user?.name}</span>
                        <button
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-800 lg:w-auto"
                            onClick={logout}
                            type="button"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    )
}
