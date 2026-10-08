import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import MySQLStoreFactory from 'express-mysql-session'
import mysql from 'mysql2/promise'

const app = express()
const port = Number(process.env.PORT || 3001)
const isProduction = process.env.NODE_ENV === 'production'
const databaseOptions = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'health_platform',
}
const pool = mysql.createPool({
  ...databaseOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
})
const MySQLStore = MySQLStoreFactory(session)
const sessionStore = new MySQLStore({
  ...databaseOptions,
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
})

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be configured in production.')
}

const allowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(session({
  name: 'health_platform_session',
  secret: process.env.SESSION_SECRET || 'local-development-session-secret-change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}))

function sendError(res, status, error) {
  return res.status(status).json({ error })
}

function publicUser(row) {
  return { id: String(row.id), name: row.name, role: row.role }
}

function requireUser(req, res, next) {
  if (!req.session.user) return sendError(res, 401, 'Session expirée. Veuillez vous reconnecter.')
  next()
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return sendError(res, 403, role === 'ADMINISTRATEUR' ? 'Accès réservé aux administrateurs.' : 'Accès non autorisé.')
    }
    next()
  }
}

function startUserSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError)
      req.session.user = publicUser(user)
      req.session.save((saveError) => {
        if (saveError) return reject(saveError)
        resolve(req.session.user)
      })
    })
  })
}

function adminAccountFromRow(row) {
  const nameParts = String(row.name || '').trim().split(/\s+/, 2)
  const account = {
    id: String(row.id),
    firstName: row.first_name || nameParts[0] || '',
    lastName: row.last_name || nameParts[1] || '',
    email: row.email,
    phone: row.phone || '',
    role: row.role,
    status: row.status || 'ACTIF',
    createdAt: row.created_at,
  }

  for (const [key, column] of Object.entries({
    staffType: 'staff_type',
    functionTitle: 'function_title',
    specialty: 'specialty',
    service: 'service',
    registrationNumber: 'registration_number',
  })) {
    if (row[column]) account[key] = row[column]
  }

  return account
}

function serviceId(service) {
  const normalized = String(service).toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (normalized.includes('medecine generale') || normalized.includes('generaliste')) return 'medecine-generale'
  if (normalized.includes('pediatrie') || normalized.includes('pediatre')) return 'pediatrie'
  if (normalized.includes('gynecologie') || normalized.includes('gynecologue')) return 'gynecologie'
  if (normalized.includes('cardiologie') || normalized.includes('cardiologue')) return 'cardiologie'
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function getVisibleAppointment(req, res, appointmentId) {
  const user = req.session.user
  if (!user || !['PATIENT', 'MEDECIN'].includes(user.role)) {
    sendError(res, 403, 'Accès non autorisé.')
    return null
  }

  const ownerColumn = user.role === 'MEDECIN' ? 'doctor_id' : 'patient_id'
  const [rows] = await pool.execute(
    `SELECT id FROM appointments WHERE id = ? AND ${ownerColumn} = ?`,
    [appointmentId, user.id],
  )
  if (!rows.length) {
    sendError(res, 404, 'Rendez-vous introuvable.')
    return null
  }
  return rows[0]
}

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok', database: 'connected' })
})

app.get('/api/auth/me', requireUser, (req, res) => {
  res.json({ user: req.session.user })
})

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!name || name.length > 120) return sendError(res, 422, 'Le nom est obligatoire (120 caractères maximum).')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 422, 'Saisissez une adresse e-mail valide.')
  if (password.length < 8) return sendError(res, 422, 'Le mot de passe doit contenir au moins 8 caractères.')

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'PATIENT')",
      [name, email, passwordHash],
    )
    const user = { id: result.insertId, name, role: 'PATIENT' }
    res.status(201).json({ user: await startUserSession(req, user) })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Un compte utilise déjà cette adresse e-mail.')
    throw error
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const [rows] = await pool.execute(
    'SELECT id, name, role, password_hash FROM users WHERE email = ? LIMIT 1',
    [email],
  )
  const user = rows[0]
  const storedHash = user?.password_hash?.replace(/^\$2y\$/, '$2b$')

  if (!user || !(await bcrypt.compare(password, storedHash))) {
    return sendError(res, 401, 'Adresse e-mail ou mot de passe incorrect.')
  }

  res.json({ user: await startUserSession(req, user) })
})

app.post('/api/auth/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error)
    res.clearCookie('health_platform_session', { httpOnly: true, sameSite: isProduction ? 'none' : 'lax', secure: isProduction })
    res.json({ success: true })
  })
})

const requireAdmin = requireRole('ADMINISTRATEUR')
app.use('/api/admin', requireAdmin)

app.get('/api/admin/accounts', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, DATE_FORMAT(u.created_at, '%Y-%m-%d') AS created_at,
            p.first_name, p.last_name, p.phone, p.registration_number,
            p.specialty, p.service, p.function_title, p.staff_type, p.status
     FROM users u LEFT JOIN account_profiles p ON p.user_id = u.id
     WHERE u.role IN ('PATIENT', 'MEDECIN', 'PERSONNEL') ORDER BY u.created_at DESC`,
  )
  res.json({ accounts: rows.map(adminAccountFromRow) })
})

app.post('/api/admin/accounts', async (req, res) => {
  const body = req.body || {}
  const role = body.role
  const firstName = String(body.firstName || '').trim()
  const lastName = String(body.lastName || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const phone = String(body.phone || '').trim()
  const password = String(body.password || '')
  const registrationNumber = String(body.registrationNumber || '').trim()
  const specialty = String(body.specialty || '').trim()
  const service = String(body.service || '').trim()
  const functionTitle = String(body.functionTitle || '').trim()
  const staffType = body.staffType || 'GENERAL'

  if (!['MEDECIN', 'PERSONNEL'].includes(role)) return sendError(res, 422, 'Le rôle doit être médecin ou personnel.')
  if (!firstName || !lastName || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, 422, 'Renseignez le nom, le prénom, le téléphone et une adresse e-mail valide.')
  }
  if (password.length < 8) return sendError(res, 422, 'Le mot de passe initial doit contenir au moins 8 caractères.')
  if ((role === 'MEDECIN' && (!registrationNumber || !specialty || !service)) || (role === 'PERSONNEL' && !functionTitle)) {
    return sendError(res, 422, 'Renseignez les informations professionnelles obligatoires.')
  }
  if (!['GENERAL', 'LABORANTIN'].includes(staffType)) return sendError(res, 422, 'Le type de personnel est invalide.')

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const passwordHash = await bcrypt.hash(password, 12)
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [`${firstName} ${lastName}`, email, passwordHash, role],
    )
    await connection.execute(
      `INSERT INTO account_profiles
       (user_id, first_name, last_name, phone, registration_number, specialty, service, function_title, staff_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, firstName, lastName, phone, role === 'MEDECIN' ? registrationNumber : null,
        role === 'MEDECIN' ? specialty : null, role === 'MEDECIN' ? service : null,
        role === 'PERSONNEL' ? functionTitle : null, role === 'PERSONNEL' ? staffType : null],
    )
    await connection.commit()
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role, DATE_FORMAT(u.created_at, '%Y-%m-%d') AS created_at,
              p.first_name, p.last_name, p.phone, p.registration_number, p.specialty,
              p.service, p.function_title, p.staff_type, p.status
       FROM users u JOIN account_profiles p ON p.user_id = u.id WHERE u.id = ?`,
      [userResult.insertId],
    )
    res.status(201).json({ account: adminAccountFromRow(rows[0]) })
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Un compte utilise déjà cette adresse e-mail.')
    throw error
  } finally {
    connection.release()
  }
})

app.patch('/api/admin/accounts/:id/status', async (req, res) => {
  const { status } = req.body || {}
  if (!['ACTIF', 'INACTIF'].includes(status)) return sendError(res, 422, 'Le statut demandé est invalide.')

  const [users] = await pool.execute(
    "SELECT id FROM users WHERE id = ? AND role <> 'ADMINISTRATEUR' LIMIT 1",
    [req.params.id],
  )
  if (!users.length) return sendError(res, 404, 'Compte introuvable.')
  await pool.execute(
    `INSERT INTO account_profiles (user_id, status) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [req.params.id, status],
  )
  res.json({ success: true })
})

app.patch('/api/admin/accounts/:id', async (req, res) => {
  const body = req.body || {}
  const firstName = String(body.firstName || '').trim()
  const lastName = String(body.lastName || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const phone = String(body.phone || '').trim()
  if (!firstName || !lastName || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, 422, 'Renseignez le nom, le prénom, le téléphone et une adresse e-mail valide.')
  }

  const [users] = await pool.execute(
    "SELECT role FROM users WHERE id = ? AND role IN ('MEDECIN', 'PERSONNEL') LIMIT 1",
    [req.params.id],
  )
  const role = users[0]?.role
  if (!role) return sendError(res, 404, 'Compte professionnel introuvable.')

  const registrationNumber = String(body.registrationNumber || '').trim()
  const specialty = String(body.specialty || '').trim()
  const service = String(body.service || '').trim()
  const functionTitle = String(body.functionTitle || '').trim()
  const staffType = body.staffType || 'GENERAL'
  if ((role === 'MEDECIN' && (!registrationNumber || !specialty || !service)) || (role === 'PERSONNEL' && !functionTitle)) {
    return sendError(res, 422, 'Renseignez les informations professionnelles obligatoires.')
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [`${firstName} ${lastName}`, email, req.params.id])
    await connection.execute(
      `INSERT INTO account_profiles
       (user_id, first_name, last_name, phone, registration_number, specialty, service, function_title, staff_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name),
         phone = VALUES(phone), registration_number = VALUES(registration_number), specialty = VALUES(specialty),
         service = VALUES(service), function_title = VALUES(function_title), staff_type = VALUES(staff_type)`,
      [req.params.id, firstName, lastName, phone, role === 'MEDECIN' ? registrationNumber : null,
        role === 'MEDECIN' ? specialty : null, role === 'MEDECIN' ? service : null,
        role === 'PERSONNEL' ? functionTitle : null, role === 'PERSONNEL' ? staffType : null],
    )
    await connection.commit()
    res.json({ success: true })
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Un compte utilise déjà cette adresse e-mail.')
    throw error
  } finally {
    connection.release()
  }
})

app.get('/api/admin/exam-types', async (_req, res) => {
  const [examTypes] = await pool.query('SELECT id, label, description, status FROM exam_types ORDER BY label')
  res.json({ examTypes: examTypes.map((item) => ({ ...item, id: String(item.id) })) })
})

app.post('/api/admin/exam-types', async (req, res) => {
  const label = String(req.body?.label || '').trim()
  const description = String(req.body?.description || '').trim()
  if (!label || !description) return sendError(res, 422, 'Le libellé et la description sont obligatoires.')
  try {
    const [result] = await pool.execute('INSERT INTO exam_types (label, description) VALUES (?, ?)', [label, description])
    res.status(201).json({ examType: { id: String(result.insertId), label, description, status: 'ACTIF' } })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Un type d’examen porte déjà ce libellé.')
    throw error
  }
})

app.patch('/api/admin/exam-types/:id', async (req, res) => {
  const { label = '', description = '', status = null } = req.body || {}
  if (status !== null && !['ACTIF', 'INACTIF'].includes(status)) return sendError(res, 422, 'Le statut demandé est invalide.')
  try {
    const [result] = status !== null && !label && !description
      ? await pool.execute('UPDATE exam_types SET status = ? WHERE id = ?', [status, req.params.id])
      : label && description
        ? await pool.execute('UPDATE exam_types SET label = ?, description = ? WHERE id = ?', [label.trim(), description.trim(), req.params.id])
        : [null]
    if (!result) return sendError(res, 422, 'Le libellé et la description sont obligatoires.')
    if (!result.affectedRows) {
      const [rows] = await pool.execute('SELECT id FROM exam_types WHERE id = ?', [req.params.id])
      if (!rows.length) return sendError(res, 404, 'Type d’examen introuvable.')
    }
    res.json({ success: true })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Un type d’examen porte déjà ce libellé.')
    throw error
  }
})

app.get('/api/appointments/doctors', requireRole('PATIENT'), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, p.first_name, p.last_name, p.specialty, p.service
     FROM users u JOIN account_profiles p ON p.user_id = u.id
     WHERE u.role = 'MEDECIN' AND p.status = 'ACTIF' AND p.service IS NOT NULL
     ORDER BY p.last_name, p.first_name`,
  )
  res.json({ doctors: rows.map((row) => {
    const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.name
    return {
      id: String(row.id),
      name: /^dr\s/i.test(fullName) ? fullName : `Dr ${fullName}`,
      specialty: row.specialty || row.service,
      serviceId: serviceId(row.service),
      photoUrl: '',
      availabilityLabel: 'Disponible sur demande',
    }
  }) })
})

app.get('/api/appointments/reserved-slots', requireRole('PATIENT'), async (req, res) => {
  const doctorId = String(req.query.doctorId || '')
  const [doctors] = await pool.execute("SELECT id FROM users WHERE id = ? AND role = 'MEDECIN'", [doctorId])
  if (!doctors.length) return sendError(res, 404, 'Médecin introuvable.')
  const [reservedSlots] = await pool.execute(
    `SELECT appointment_date AS date, TIME_FORMAT(appointment_time, '%H:%i') AS time
     FROM appointments WHERE doctor_id = ? AND status IN ('EN_ATTENTE', 'CONFIRME')`,
    [doctorId],
  )
  res.json({ reservedSlots })
})

app.post('/api/appointments', requireRole('PATIENT'), async (req, res) => {
  const doctorId = String(req.body?.doctorId || '')
  const serviceName = String(req.body?.serviceName || '').trim()
  const date = String(req.body?.date || '')
  const time = String(req.body?.time || '')
  const reason = String(req.body?.reason || '').trim()
  const details = String(req.body?.details || '').trim()
  if (!serviceName || !reason || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return sendError(res, 422, 'Les informations du rendez-vous sont incomplètes.')
  }
  if (new Date(`${date}T${time}:00`) <= new Date()) return sendError(res, 422, 'Choisissez un créneau futur.')

  const [doctors] = await pool.execute(
    `SELECT u.id FROM users u JOIN account_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'MEDECIN' AND p.status = 'ACTIF' AND LOWER(p.service) = LOWER(?)`,
    [doctorId, serviceName],
  )
  if (!doctors.length) return sendError(res, 422, 'Le médecin sélectionné n’est plus disponible pour ce service.')

  try {
    const [result] = await pool.execute(
      `INSERT INTO appointments (patient_id, doctor_id, service_name, appointment_date, appointment_time, reason, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'EN_ATTENTE')`,
      [req.session.user.id, doctorId, serviceName, date, time, reason, details || null],
    )
    res.status(201).json({ appointment: { id: String(result.insertId), status: 'EN_ATTENTE', patientConfirmedAt: new Date().toISOString() } })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Ce créneau vient d’être réservé pour ce médecin. Veuillez en choisir un autre.')
    throw error
  }
})

app.get('/api/appointments', requireUser, async (req, res) => {
  const user = req.session.user
  if (!['PATIENT', 'MEDECIN'].includes(user.role)) return sendError(res, 403, 'Accès non autorisé.')
  const ownerColumn = user.role === 'MEDECIN' ? 'a.doctor_id' : 'a.patient_id'
  const [rows] = await pool.execute(
    `SELECT a.id, a.doctor_id, a.service_name, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
            TIME_FORMAT(a.appointment_time, '%H:%i') AS appointment_time, a.reason, a.details, a.status,
            a.patient_confirmed_at, patient.name AS patient_name, doctor.name AS doctor_name
     FROM appointments a JOIN users patient ON patient.id = a.patient_id
     JOIN users doctor ON doctor.id = a.doctor_id WHERE ${ownerColumn} = ?
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    [user.id],
  )
  res.json({ appointments: rows.map((row) => ({
    id: String(row.id),
    doctorId: String(row.doctor_id),
    doctorName: row.doctor_name,
    patientName: row.patient_name,
    serviceName: row.service_name,
    date: row.appointment_date,
    time: row.appointment_time,
    reason: row.reason,
    details: row.details || '',
    status: row.status,
    patientConfirmedAt: row.patient_confirmed_at,
  })) })
})

app.get('/api/appointments/:id/messages', async (req, res) => {
  const appointment = await getVisibleAppointment(req, res, req.params.id)
  if (!appointment) return
  const [rows] = await pool.execute(
    `SELECT m.id, m.message, m.created_at, u.name AS sender_name, u.role AS sender_role
     FROM appointment_messages m JOIN users u ON u.id = m.sender_id
     WHERE m.appointment_id = ? ORDER BY m.created_at, m.id`,
    [appointment.id],
  )
  res.json({ messages: rows.map((row) => ({
    id: String(row.id),
    message: row.message,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    createdAt: row.created_at,
  })) })
})

app.post('/api/appointments/:id/messages', async (req, res) => {
  const appointment = await getVisibleAppointment(req, res, req.params.id)
  if (!appointment) return
  const message = String(req.body?.message || '').trim()
  if (!message || message.length > 5000) return sendError(res, 422, 'Le message est obligatoire et ne doit pas dépasser 5 000 caractères.')
  await pool.execute(
    'INSERT INTO appointment_messages (appointment_id, sender_id, message) VALUES (?, ?, ?)',
    [appointment.id, req.session.user.id, message],
  )
  res.status(201).json({ success: true })
})

app.use('/api', (_req, res) => sendError(res, 404, 'Route API introuvable.'))

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'Une donnée identique existe déjà.')
  sendError(res, 503, 'API ou base de données indisponible. Vérifiez les paramètres du serveur.')
})

async function startServer() {
  await pool.query('SELECT 1')
  app.listen(port, '0.0.0.0', () => {
    console.log(`Node API listening on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Unable to start the Node API:', error.message)
  process.exitCode = 1
})