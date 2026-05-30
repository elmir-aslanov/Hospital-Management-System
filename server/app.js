import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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
import ratingsRoutes      from './modules/ratings/ratings.routes.js';
import certificatesRoutes from './modules/certificates/certificates.routes.js';
import shiftsRoutes       from './modules/shifts/shifts.routes.js';
import inventoryRoutes    from './modules/inventory/inventory.routes.js';
import exportRoutes         from './modules/export/export.routes.js';
import aiRoutes             from './modules/ai/ai.routes.js';
import consultationsRoutes  from './modules/consultations/consultations.routes.js';
import siteDoctorsRoutes    from './modules/sitedoctors/sitedoctors.routes.js';
// ── Public website modules ────────────────────────────────────────────────────
import departmentsRoutes    from './modules/departments/departments.routes.js';
import servicesRoutes       from './modules/services/services.routes.js';
import blogRoutes           from './modules/blog/blog.routes.js';
import contactRoutes        from './modules/contact/contact.routes.js';
import muracietRoutes       from './modules/muraciet/muraciet.routes.js';
import adminRoutes          from './modules/admin/admin.routes.js';
import doctorDashRoutes     from './modules/doctor/doctor.routes.js';
import billingRoutes        from './modules/billing/billing.routes.js';

const app = express();

// ── Swagger ───────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aslan Medical Clinic API',
      version: '1.0.0',
      description: 'Hospital Management System REST API',
      contact: { name: 'Elmir Aslanov', email: 'info@aslanmedical.az' },
    },
    servers: [{ url: 'http://localhost:5000/api/v1', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./modules/**/*.routes.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #0a1628 }',
  customSiteTitle: 'Aslan Medical API Docs',
}));

// ── Security & parsing middleware ─────────────────────────────────────────────
const corsOptions = {
  origin: (origin, cb) => {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
    ];
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));   // preflight bütün route-lar üçün
app.use(helmet({ crossOriginResourcePolicy: false }));
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
app.use(`${API}/ratings`,       ratingsRoutes);
app.use(`${API}/certificates`,  certificatesRoutes);
app.use(`${API}/shifts`,        shiftsRoutes);
app.use(`${API}/inventory`,     inventoryRoutes);
app.use(`${API}/export`,         exportRoutes);
app.use(`${API}/ai`,             aiRoutes);
app.use(`${API}/consultations`,  consultationsRoutes);
app.use(`${API}/site-doctors`,   siteDoctorsRoutes);
// ── Public website ─────────────────────────────────────────────────────────────
app.use(`${API}/departments`,    departmentsRoutes);
app.use(`${API}/services`,       servicesRoutes);
app.use(`${API}/blog`,           blogRoutes);
app.use(`${API}/contact`,        contactRoutes);
app.use(`${API}/muraciet`,       muracietRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/doctor`,        doctorDashRoutes);
app.use(`${API}/billing`,       billingRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler — must be last ──────────────────────────────────────
app.use(errorHandler);

export default app;
