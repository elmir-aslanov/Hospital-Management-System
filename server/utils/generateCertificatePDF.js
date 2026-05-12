import PDFDocument from 'pdfkit';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

const TYPE_LABELS = {
  sick_leave:           'SICK LEAVE CERTIFICATE',
  fitness:              'FITNESS CERTIFICATE',
  specialist_referral:  'SPECIALIST REFERRAL',
  medical_report:       'MEDICAL REPORT',
};

/**
 * Generate a medical certificate PDF.
 * @param {object} data
 * @returns {Promise<Buffer>}
 */
export const createMedicalCertificatePDF = (data) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 60, size: 'A4' });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ─────────────────────────────────────────────────────────────
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a1a2e')
      .text('HOSPITAL MANAGEMENT SYSTEM', { align: 'center' });

    doc.fontSize(14).font('Helvetica')
      .text(TYPE_LABELS[data.type] || 'MEDICAL CERTIFICATE', { align: 'center' });

    // Certificate number — top right
    doc.fontSize(9).fillColor('#555')
      .text(`No: ${data.certificateNumber}`, { align: 'right' });

    doc.moveDown(0.3)
      .moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y)
      .strokeColor('#1a1a2e').lineWidth(1.5).stroke()
      .moveDown(0.8);

    // ── Issued date ────────────────────────────────────────────────────────
    doc.fontSize(10).fillColor('#333').font('Helvetica')
      .text(`Date of Issue: ${fmt(data.issuedAt)}`, { align: 'right' });
    doc.moveDown(0.5);

    // ── Patient section ────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica')
      .text('This is to certify that:');
    doc.moveDown(0.3);

    doc.fontSize(12).font('Helvetica-Bold')
      .text(data.patientName || 'N/A', { indent: 20 });
    doc.fontSize(10).font('Helvetica').fillColor('#555')
      .text(`Patient ID: ${data.patientId || 'N/A'}`, { indent: 20 });
    if (data.patientAge) doc.text(`Age: ${data.patientAge} years`, { indent: 20 });

    doc.moveDown(0.6);

    // ── Diagnosis ──────────────────────────────────────────────────────────
    if (data.diagnosis) {
      doc.fontSize(11).fillColor('#333').font('Helvetica')
        .text('has been examined and found to have:');
      doc.moveDown(0.2);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e')
        .text(data.diagnosis, { indent: 20 });
      doc.moveDown(0.5);
    }

    // ── Purpose ────────────────────────────────────────────────────────────
    doc.fontSize(11).fillColor('#333').font('Helvetica')
      .text('Purpose / Reason:');
    doc.fontSize(11).font('Helvetica-Bold')
      .text(data.purpose, { indent: 20 });
    doc.moveDown(0.5);

    // ── Recommendations ────────────────────────────────────────────────────
    if (data.recommendations) {
      doc.fontSize(11).fillColor('#333').font('Helvetica').text('Recommendations:');
      doc.fontSize(10).font('Helvetica').text(data.recommendations, { indent: 20 });
      doc.moveDown(0.5);
    }

    // ── Validity ───────────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica').fillColor('#333').text('Validity Period:');
    doc.fontSize(10).font('Helvetica')
      .text(`From: ${fmt(data.validFrom)}`, { indent: 20 })
      .text(`Until: ${data.validUntil ? fmt(data.validUntil) : 'Until further notice'}`, { indent: 20 });

    doc.moveDown(1.5);

    // ── Doctor signature section ───────────────────────────────────────────
    doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y)
      .strokeColor('#cccccc').lineWidth(0.5).stroke().moveDown(0.5);

    const sigX = doc.page.width - 260;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a2e')
      .text('Attending Physician:', sigX);
    doc.fontSize(10).font('Helvetica').fillColor('#333')
      .text(data.doctorName || 'N/A', sigX)
      .text(data.doctorSpecialization || '', sigX)
      .text(`License No: ${data.licenseNumber || 'N/A'}`, sigX);

    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica').text('Signature: ___________________________', sigX);

    // ── Footer ─────────────────────────────────────────────────────────────
    doc.moveDown(2)
      .fontSize(8).fillColor('#888').font('Helvetica')
      .text(
        `Certificate No: ${data.certificateNumber}  |  Issued: ${fmt(data.issuedAt)}  |  Hospital Management System`,
        { align: 'center' }
      );

    doc.end();
  });
