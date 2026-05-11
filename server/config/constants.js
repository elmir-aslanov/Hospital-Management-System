export const ROLES = Object.freeze({
  SUPER_ADMIN:    'SUPER_ADMIN',
  ADMIN:          'ADMIN',
  DOCTOR:         'DOCTOR',
  NURSE:          'NURSE',
  RECEPTIONIST:   'RECEPTIONIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  PATIENT:        'PATIENT',
});

export const APPOINTMENT_STATUS = Object.freeze({
  SCHEDULED:   'scheduled',
  WAITING:     'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
  MISSED:      'missed',
});

export const BED_STATUS = Object.freeze({
  AVAILABLE:   'available',
  OCCUPIED:    'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED:    'reserved',
});

export const ADMISSION_STATUS = Object.freeze({
  ACTIVE:      'active',
  DISCHARGED:  'discharged',
  TRANSFERRED: 'transferred',
});

export const VISIT_STATUS = Object.freeze({
  OPEN:        'open',
  IN_PROGRESS: 'in_progress',
  CLOSED:      'closed',
});

// Valid status transitions for appointments
export const APPOINTMENT_TRANSITIONS = Object.freeze({
  scheduled:   ['waiting', 'cancelled', 'missed'],
  waiting:     ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed:   [],
  cancelled:   [],
  missed:      [],
});
