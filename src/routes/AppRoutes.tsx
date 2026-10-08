import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { DoctorLayout } from '../layouts/DoctorLayout'
import { PatientLayout } from '../layouts/PatientLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { Dashboard } from '../pages/Dashboard'
import { DoctorDashboard } from '../pages/DoctorDashboard'
import { DoctorFeaturePage } from '../pages/DoctorFeaturePage'
import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { NotFound } from '../pages/NotFound'
import { PatientDashboard } from '../pages/PatientDashboard'
import { Register } from '../pages/Register'
import { Services } from '../pages/Services'
import { Unauthorized } from '../pages/Unauthorized'
import { AppointmentBooking } from '../features/appointments/pages/AppointmentBooking'
import { AdminDashboard } from '../features/administration/pages/AdminDashboard'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Login />} path="/connexion" />
        <Route element={<Register />} path="/inscription" />
        <Route element={<Unauthorized />} path="/non-autorise" />

        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route element={<PatientLayout />}>
            <Route element={<PatientDashboard />} path="/tableau-de-bord/patient" />
            <Route element={<Services />} path="/services" />
            <Route element={<AppointmentBooking />} path="/services/rendez-vous" />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['MEDECIN']} />}>
          <Route element={<DoctorLayout />}>
            <Route element={<DoctorDashboard />} path="/tableau-de-bord/medecin" />
            <Route
              element={<DoctorFeaturePage description="Consultez et organisez vos disponibilités au centre de santé." title="Mon planning" />}
              path="/medecin/planning"
            />
            <Route
              element={<DoctorFeaturePage description="Retrouvez les demandes et les rendez-vous confirmés qui vous concernent." title="Rendez-vous" />}
              path="/medecin/rendez-vous"
            />
            <Route
              element={<DoctorFeaturePage description="Accédez aux patients suivis dans le cadre des consultations du centre." title="Patients" />}
              path="/medecin/patients"
            />
            <Route
              element={<DoctorFeaturePage description="Ouvrez et suivez les consultations associées aux rendez-vous." title="Consultations" />}
              path="/medecin/consultations"
            />
            <Route
              element={<DoctorFeaturePage description="Consultez les demandes d’examen émises dans le cadre des consultations." title="Demandes d’examen" />}
              path="/medecin/examens"
            />
            <Route
              element={<DoctorFeaturePage description="Retrouvez les résultats transmis par le personnel spécialisé." title="Résultats" />}
              path="/medecin/resultats"
            />
            <Route
              element={<DoctorFeaturePage description="Consultez les informations importantes liées à votre activité." title="Notifications" />}
              path="/medecin/notifications"
            />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['PERSONNEL']} />}>
          <Route element={<StaffLayout />}>
            <Route element={<Dashboard />} path="/tableau-de-bord/personnel" />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATEUR']} />}>
          <Route element={<AdminLayout />}>
            <Route element={<AdminDashboard />} path="/tableau-de-bord/administrateur" />
          </Route>
        </Route>

        <Route element={<NotFound />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}
