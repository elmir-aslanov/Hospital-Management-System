import PDFDocument from 'pdfkit';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

const section = (doc, title) => {
  doc.moveDown(0.5)
    .fontSize(11)
    .fillColor('#1a1a2e')
    .font('Helvetica-Bold')
    .text(title.toUpperCase())
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .stroke()
    .moveDown(0.3)
    .font('Helvetica')
    .fillColor('#333333')
    .fontSize(10);
};

const row = (doc, label, value) => {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true })
    .font('Helvetica').text(value || 'N/A');
};

/**
 * Generate a discharge summary PDF.
 * @param {object} data
 * @returns {Promise<Buffer>}
 */
export const createDischargePDF = (data) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a1a2e')
      .text('HOSPITAL MANAGEMENT SYSTEM', { align: 'center' });
    doc.fontSize(13).font('Helvetica').fillColor('#555555')
      .text('DISCHARGE SUMMARY', { align: 'center' });
    doc.moveDown(0.3)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#1a1a2e').lineWidth(1.5).stroke()
      .moveDown(0.5);

    // ── Patient Information ───────────────────────────────────────────────────
    section(doc, 'Patient Information');
    row(doc, 'Patient Name', data.patientName);
    row(doc, 'Patient ID',   data.patientId);
    row(doc, 'Blood Group',  data.bloodGroup);

    // ── Attending Physician ───────────────────────────────────────────────────
    section(doc, 'Attending Physician');
    row(doc, 'Doctor Name',     data.doctorName);
    row(doc, 'Specialization',  data.doctorSpecialization);

    // ── Admission Details ─────────────────────────────────────────────────────
    section(doc, 'Admission Details');
    row(doc, 'Admission Date',  fmt(data.admissionDate));
    row(doc, 'Discharge Date',  fmt(data.dischargeDate));

    // ── Diagnosis & Treatment ─────────────────────────────────────────────────
    section(doc, 'Diagnosis & Treatment');
    row(doc, 'Final Diagnosis', data.finalDiagnosis);
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text('Treatment Summary:', { underline: false });
    doc.font('Helvetica').text(data.treatmentSummary || 'N/A');

    // ── Discharge Medications ─────────────────────────────────────────────────
    section(doc, 'Discharge Medications');
    if (data.dischargeMedications?.length) {
      // Table header
      const col = { name: 50, dosage: 220, inst: 340 };
      doc.font('Helvetica-Bold').fontSize(9)
        .text('Medication',   col.name, doc.y, { width: 160, continued: false });
      const headerY = doc.y - doc.currentLineHeight();
      doc.text('Dosage',       col.dosage, headerY, { width: 110 });
      doc.text('Instructions', col.inst,   headerY, { width: 190 });
      doc.moveDown(0.2).font('Helvetica').fontSize(9);

      data.dischargeMedications.forEach((med) => {
        const rowY = doc.y;
        doc.text(med.name || '—',         col.name,  rowY, { width: 160 });
        doc.text(med.dosage || '—',       col.dosage, rowY, { width: 110 });
        doc.text(med.instructions || '—', col.inst,   rowY, { width: 190 });
        doc.moveDown(0.2);
      });
    } else {
      doc.text('No discharge medications.');
    }

    // ── Follow-Up ─────────────────────────────────────────────────────────────
    section(doc, 'Follow-Up');
    row(doc, 'Follow-Up Date',         fmt(data.followUpDate));
    row(doc, 'Follow-Up Instructions', data.followUpInstructions);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.moveDown(2)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#cccccc').lineWidth(0.5).stroke()
      .moveDown(0.3)
      .fontSize(8).fillColor('#888888').font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}  |  Hospital Management System`, { align: 'center' });

    doc.end();
  });
