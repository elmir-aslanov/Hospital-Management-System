import xlsx from 'xlsx';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

/**
 * Create an xlsx Buffer from headers + rows.
 */
const createWorkbook = (sheetName, headers, rows) => {
  const ws = xlsx.utils.aoa_to_sheet([headers, ...rows]);

  // Column widths
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const exportPatientsToExcel = (patients) => {
  const headers = [
    'Patient ID', 'Full Name', 'Email', 'Phone',
    'Blood Group', 'Allergies', 'Chronic Conditions', 'Registration Date',
  ];
  const rows = patients.map((p) => [
    p.patientId               || '',
    p.userId?.fullName        || '',
    p.userId?.email           || '',
    p.userId?.phone           || '',
    p.bloodGroup              || '',
    (p.allergies || []).join(', '),
    (p.chronicConditions || []).join(', '),
    fmt(p.createdAt),
  ]);
  return createWorkbook('Patients', headers, rows);
};

export const exportAppointmentsToExcel = (appointments) => {
  const headers = [
    'Date', 'Start Time', 'End Time',
    'Patient Name', 'Doctor Name', 'Specialization',
    'Status', 'Reason',
  ];
  const rows = appointments.map((a) => [
    fmt(a.date),
    a.startTime                              || '',
    a.endTime                                || '',
    a.patientId?.userId?.fullName            || '',
    a.doctorId?.userId?.fullName             || '',
    a.doctorId?.specialization               || '',
    a.status                                 || '',
    a.reason                                 || '',
  ]);
  return createWorkbook('Appointments', headers, rows);
};

export const exportInventoryToExcel = (medicines) => {
  const headers = [
    'Medicine Name', 'Generic Name', 'Category', 'Unit',
    'Current Stock', 'Min Stock Level', 'Unit Price (AZN)',
    'Total Value (AZN)', 'Status',
  ];
  const rows = medicines.map((m) => {
    const status = m.stock === 0 ? 'Critical' : m.stock <= m.minStockLevel ? 'Low' : 'OK';
    return [
      m.name            || '',
      m.genericName     || '',
      m.category        || '',
      m.unit            || '',
      m.stock,
      m.minStockLevel,
      m.unitPrice,
      +(m.stock * m.unitPrice).toFixed(2),
      status,
    ];
  });
  return createWorkbook('Inventory', headers, rows);
};

export const exportAuditLogToExcel = (logs) => {
  const headers = [
    'Date', 'Time', 'User Name', 'Role',
    'Action', 'Resource Type', 'Description', 'IP Address',
  ];
  const rows = logs.map((l) => [
    fmt(l.createdAt),
    fmtTime(l.createdAt),
    l.userId?.fullName  || '',
    l.userId?.role      || '',
    l.action            || '',
    l.resourceType      || '',
    l.description       || '',
    l.ipAddress         || '',
  ]);
  return createWorkbook('Audit Log', headers, rows);
};
