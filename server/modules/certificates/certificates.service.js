import { v2 as cloudinary } from 'cloudinary';
import MedicalCertificate from '../../models/MedicalCertificate.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';
import { createMedicalCertificatePDF } from '../../utils/generateCertificatePDF.js';

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });

const populateCert = (q) =>
  q.populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
   .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization licenseNumber' })
   .populate('visitId', 'chiefComplaint diagnosis');

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const createCertificate = async (data, doctorId) => {
  const [visit, patient, doctor] = await Promise.all([
    Visit.findById(data.visitId),
    Patient.findById(data.patientId).populate('userId', 'fullName'),
    Doctor.findById(doctorId).populate('userId', 'fullName'),
  ]);

  if (!visit)   throw new ApiError(404, 'Visit not found');
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You are not authorized to issue certificate for this visit');
  }

  const cert = await MedicalCertificate.create({ ...data, doctorId });

  // Generate PDF
  try {
    const pdfData = {
      certificateNumber:    cert.certificateNumber,
      type:                 cert.type,
      issuedAt:             cert.issuedAt,
      patientName:          patient.userId?.fullName || 'N/A',
      patientId:            patient.patientId || 'N/A',
      doctorName:           doctor.userId?.fullName || 'N/A',
      doctorSpecialization: doctor.specialization || 'N/A',
      licenseNumber:        doctor.licenseNumber || 'N/A',
      purpose:              cert.purpose,
      diagnosis:            cert.diagnosis || '',
      recommendations:      cert.recommendations || '',
      validFrom:            cert.validFrom,
      validUntil:           cert.validUntil,
    };

    const pdfBuffer = await createMedicalCertificatePDF(pdfData);
    const pdfUrl = await uploadBuffer(pdfBuffer, {
      resource_type: 'raw',
      folder: 'medical-certificates',
      public_id: `cert-${cert._id}`,
      format: 'pdf',
    });
    cert.pdfUrl = pdfUrl;
    await cert.save();
  } catch {
    // PDF upload failure does not block certificate creation
  }

  return populateCert(MedicalCertificate.findById(cert._id));
};

export const getCertificateById = async (id) => {
  const cert = await populateCert(MedicalCertificate.findById(id));
  if (!cert) throw new ApiError(404, 'Certificate not found');
  return cert;
};

export const getPatientCertificates = async (patientId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const [certificates, total] = await Promise.all([
    populateCert(MedicalCertificate.find({ patientId })).sort({ issuedAt: -1 }).skip(skip).limit(lim),
    MedicalCertificate.countDocuments({ patientId }),
  ]);
  return { certificates, total, page: pg, limit: lim };
};
