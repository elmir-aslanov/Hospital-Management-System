import PDFDocument from 'pdfkit';

/**
 * Generate a discharge summary PDF.
 * @param {object} data - DischargeSummary document (populated)
 * @returns {Promise<Buffer>}
 */
export const createDischargePDF = (data) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Hospital Management System', { align: 'center' });
    doc.fontSize(14).text('Discharge Summary', { align: 'center' });
    doc.moveDown();

    // Patient info section
    doc.fontSize(12).text(`Patient ID: ${data.patientId}`);
    doc.text(`Admission Date: ${data.admissionDate?.toDateString?.() ?? data.admissionDate}`);
    doc.text(`Discharge Date: ${data.dischargeDate?.toDateString?.() ?? data.dischargeDate}`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(13).text('Final Diagnosis', { underline: true });
    doc.fontSize(11).text(data.finalDiagnosis || 'N/A');
    doc.moveDown();

    // Treatment summary
    doc.fontSize(13).text('Treatment Summary', { underline: true });
    doc.fontSize(11).text(data.treatmentSummary || 'N/A');
    doc.moveDown();

    // Discharge medications
    doc.fontSize(13).text('Discharge Medications', { underline: true });
    if (data.dischargeMedications?.length) {
      data.dischargeMedications.forEach((med, i) => {
        doc.fontSize(11).text(`${i + 1}. ${med.name} — ${med.dosage}, ${med.frequency}`);
      });
    } else {
      doc.fontSize(11).text('None');
    }
    doc.moveDown();

    // Follow-up
    doc.fontSize(13).text('Follow-Up', { underline: true });
    doc.fontSize(11).text(`Date: ${data.followUpDate?.toDateString?.() ?? 'N/A'}`);
    doc.text(`Instructions: ${data.followUpInstructions || 'N/A'}`);

    doc.end();
  });
