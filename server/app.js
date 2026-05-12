import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Module routers
import authRoutes         from './modules/auth/auth.routes.js';
import userRoutes         from './modules/users/users.routes.js';
import patientRoutes      from './modules/patients/patients.routes.js';
import doctorRoutes       from './modules/doctors/doctors.routes.js';
import appointmentRoutes  from './modules/appointments/appointments.routes.js';
import wardRoutes         from './modules/wards/wards.routes.js';
import admissionRoutes    from './modules/admissions/admissions.routes.js';
import visitRoutes        from './modules/visits/visits.routes.js';
import prescriptionRoutes from './modules/prescriptions/prescriptions.routes.js';
import dischargeRoutes    from './modules/discharge/discharge.routes.js';
import searchRoutes       from './modules/search/search.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import vitalsRoutes       from './modules/vitals/vitals.routes.js';
import auditRoutes        from './modules/audit/audit.routes.js';
import analyticsRoutes    from './modules/analytics/analytics.routes.js';
import dashboardRoutes    from './modules/dashboard/dashboard.routes.js';

const app = express();

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/patients`,      patientRoutes);
app.use(`${API}/doctors`,       doctorRoutes);
app.use(`${API}/appointments`,  appointmentRoutes);
app.use(`${API}/wards`,         wardRoutes);
app.use(`${API}/admissions`,    admissionRoutes);
app.use(`${API}/visits`,        visitRoutes);
app.use(`${API}/prescriptions`, prescriptionRoutes);
app.use(`${API}/discharge`,     dischargeRoutes);
app.use(`${API}/search`,        searchRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/vitals`,        vitalsRoutes);
app.use(`${API}/audit`,         auditRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);
app.use(`${API}/dashboard`,     dashboardRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler — must be last ──────────────────────────────────────
app.use(errorHandler);

export default app;
