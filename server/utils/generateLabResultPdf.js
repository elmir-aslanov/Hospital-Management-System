import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

// PDFKit's standard "Helvetica"/"Helvetica-Bold" fonts don't cover Azerbaijani
// characters (ə, ğ, ı, ş, ç). Register a Unicode-capable font and use it for
// all text in this document instead.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_REGULAR = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD    = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans-Bold.ttf');

const fmt = (d) => d ? new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const STATUS_LABELS = { normal: 'Normal', low: 'Aşağı', high: 'Yüksək', critical: 'Kritik', pending: 'Gözləyir' };

const section = (doc, title) => {
  doc.moveDown(0.6)
    .fontSize(11)
    .fillColor('#071B3B')
    .font('AzFont-Bold')
    .text(title.toUpperCase())
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .stroke()
    .moveDown(0.3)
    .font('AzFont')
    .fillColor('#333333')
    .fontSize(10);
};

const row = (doc, label, value) => {
  doc.font('AzFont-Bold').text(`${label}: `, { continued: true })
    .font('AzFont').text(value || '—');
};

// Masks all but the first character and last two characters of a FIN code.
const maskFin = (fin) => {
  const clean = String(fin || '').trim();
  if (clean.length <= 3) return clean ? `${clean[0]}***` : '—';
  return `${clean[0]}${'*'.repeat(clean.length - 3)}${clean.slice(-2)}`;
};

/**
 * Generate a certified lab-result PDF report.
 * @param {object} data — LabResult document (plain object) with resultItems already resolved
 * @returns {Promise<Buffer>}
 */
export const createLabResultPDF = (data) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.registerFont('AzFont', FONT_REGULAR);
    doc.registerFont('AzFont-Bold', FONT_BOLD);
    doc.font('AzFont');

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(18).font('AzFont-Bold').fillColor('#071B3B')
      .text('ASLAN MEDICAL CENTER', { align: 'center' });
    doc.fontSize(12).font('AzFont').fillColor('#00848e')
      .text('Laborator Analiz Nəticəsi', { align: 'center' });
    doc.moveDown(0.3)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#00848e').lineWidth(1.5).stroke()
      .moveDown(0.5);

    // ── Patient & protocol ─────────────────────────────────────────────────
    section(doc, 'Pasiyent məlumatları');
    row(doc, 'Ad Soyad',      data.patientFullName);
    row(doc, 'FİN',           maskFin(data.patientFin));
    row(doc, 'Doğum tarixi',  fmt(data.patientBirthDate));

    section(doc, 'Analiz məlumatları');
    row(doc, 'Protokol nömrəsi', data.protocolNo);
    row(doc, 'Test adı',         data.testName);
    row(doc, 'Test kodu',        data.testCode);
    row(doc, 'Şöbə',             data.departmentName);
    row(doc, 'Nümunə tarixi',    fmt(data.sampleDate));
    row(doc, 'Nəticə tarixi',    fmt(data.resultDate));
    row(doc, 'Həkim',            data.doctorName);

    // ── Result items table ─────────────────────────────────────────────────
    section(doc, 'Parametrlər');
    const items = Array.isArray(data.results) ? data.results : [];
    if (items.length) {
      const col = { name: 50, value: 210, unit: 290, range: 350, status: 460 };
      doc.font('AzFont-Bold').fontSize(9);
      const headerY = doc.y;
      doc.text('Parametr',  col.name,  headerY, { width: 155 });
      doc.text('Nəticə',    col.value, headerY, { width: 75 });
      doc.text('Vahid',     col.unit,  headerY, { width: 55 });
      doc.text('Referans',  col.range, headerY, { width: 105 });
      doc.text('Status',    col.status, headerY, { width: 95 });
      doc.moveDown(0.4).font('AzFont').fontSize(9);

      items.forEach((item) => {
        const rowY = doc.y;
        doc.fillColor('#333333');
        doc.text(item.testName || '—',          col.name,  rowY, { width: 155 });
        doc.text(item.value || '—',              col.value, rowY, { width: 75 });
        doc.text(item.unit || '—',                col.unit,  rowY, { width: 55 });
        doc.text(item.referenceRange || '—',      col.range, rowY, { width: 105 });
        doc.text(STATUS_LABELS[item.status] || item.status || '—', col.status, rowY, { width: 95 });
        doc.moveDown(0.35);
      });
    } else {
      doc.text('Parametr daxil edilməyib.');
    }

    // ── Conclusion ──────────────────────────────────────────────────────────
    section(doc, 'Ümumi nəticə');
    doc.font('AzFont').text(data.generalConclusion || '—');

    // ── Approval ────────────────────────────────────────────────────────────
    section(doc, 'Təsdiq');
    row(doc, 'Laborant',     data.labTechnicianName);
    row(doc, 'Təsdiqləyən',  data.approvedByName);
    row(doc, 'Təsdiq tarixi', fmt(data.approvedAt));

    // ── Footer disclaimer ───────────────────────────────────────────────────
    doc.moveDown(1.2)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#cccccc').lineWidth(0.5).stroke()
      .moveDown(0.4)
      .fontSize(8.5).fillColor('#666666').font('AzFont-Bold')
      .text('Bu nəticə yalnız həkim tərəfindən klinik məlumatlarla birlikdə qiymətləndirilməlidir.', { align: 'center' });
    doc.moveDown(0.3)
      .fontSize(8).fillColor('#999999').font('AzFont')
      .text(`Yaradılma tarixi: ${new Date().toLocaleString('az-AZ')}  |  Aslan Medical Center`, { align: 'center' });

    doc.end();
  });
