# Hospital Management System — Project Context

## Project
Code Academy Final Project — Project 03: Online Hospital Management System
Stack: MERN (MongoDB, Express.js, React.js, Node.js)

## Required Features (all mandatory, equal weight)
- F1: Patient registration and profile management with medical history
- F2: Doctor profiles with specializations, schedules, and availability
- F3: Appointment booking system with conflict detection
- F4: Admin management of wards, rooms, and bed availability
- F5: Prescription management linked to patient visits
- F6: Role-based access: Admin, Doctor, Nurse, Patient
- F7: Patient discharge summary generation per visit
- F8: Search and filter patients by name, ID, or condition

## Roles
SUPER_ADMIN, ADMIN, DOCTOR, NURSE, RECEPTIONIST, LAB_TECHNICIAN, PATIENT

## Project structure
/server  → Express.js backend (Node.js)
/client  → React.js frontend (Vite)

## Backend conventions
- All routes: /api/v1/...
- Every controller wrapped with asyncHandler
- ApiError / ApiResponse classes for all responses
- JWT access token (15min) + refresh token (7d)
- authorize('ROLE') middleware for RBAC
- timestamps: true on every Mongoose model
- Business logic lives in service files, not controllers
- async/await only — no callbacks

## Backend modules
auth, users, patients, doctors, appointments,
wards, admissions, visits, prescriptions,
discharge, ehr, search, notifications

## Key business rules
- Appointment conflict detection: check overlapping slots before creating
- Bed assignment: throw 409 if bed status is not 'available'
- Discharge summary: auto-close linked Visit on creation, generate PDF via pdfkit
- Patient ID format: P-XXXX (auto-generated via pre-save hook)
- Medical records are immutable — no delete, append only

## Do not
- Put business logic in controllers (goes in service files)
- Use callbacks — async/await only
- Leave empty files — always add skeleton code
- Repeat role checks inside service files (middleware handles it)
