import mongoose from 'mongoose';

// Separate from EHR's approvalStatus workflow on purpose — that machinery
// models clinical approval by a superior (BAS_HEKIM), while a consent form
// is confirmed or declined by the PATIENT themselves.
const consentFormSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    relatedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EHR', default: null },

    consentType: {
      type: String,
      enum: ['procedure_consent', 'operation_consent', 'anesthesia_consent', 'lab_test_consent', 'data_processing_consent', 'treatment_consent'],
      required: true,
    },
    title:   { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },

    status: {
      type: String,
      enum: ['draft', 'pending_patient', 'signed', 'declined', 'archived'],
      default: 'draft',
    },

    sentAt:     { type: Date, default: null },
    signedAt:   { type: Date, default: null },
    signedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    declinedAt:     { type: Date, default: null },
    declinedReason: { type: String, trim: true, maxlength: 1000, default: '' },

    archivedAt: { type: Date, default: null },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

consentFormSchema.index({ patientId: 1, createdAt: -1 });
consentFormSchema.index({ doctorId: 1, createdAt: -1 });
consentFormSchema.index({ status: 1 });

export default mongoose.model('ConsentForm', consentFormSchema);
