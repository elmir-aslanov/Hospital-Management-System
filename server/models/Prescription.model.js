import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    dosage:       { type: String, required: true, trim: true },
    frequency:    { type: String, required: true, trim: true },
    duration:     { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    quantity:     { type: Number, min: 1 },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    visitId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',   required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    patientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
    medications:  { type: [medicationSchema], required: true },
    notes:        { type: String, trim: true }, // general instructions
    diagnosis:    { type: String, trim: true, default: '' },
    clinicalNote: { type: String, trim: true, default: '' },

    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Medical records are append-only — "deleting" a prescription cancels or
    // archives it instead of removing the document, so the clinical history
    // stays intact. `status` is the source of truth; `isCancelled` is kept in
    // sync alongside it for backward compatibility with existing reads.
    status:       { type: String, enum: ['active', 'cancelled', 'archived', 'superseded'], default: 'active' },
    isCancelled:  { type: Boolean, default: false },
    cancelledAt:  { type: Date, default: null },
    cancelledBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelReason: { type: String, trim: true, default: '' },
    archivedAt:    { type: Date, default: null },
    archivedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    archiveReason: { type: String, trim: true, default: '' },

    // Pharmacy dispensing — kept separate from `medications` (which is
    // clinical content and immutable) so recording a dispense never trips
    // the protectClinicalContent guard below.
    dispensingStatus: { type: String, enum: ['pending', 'partially_dispensed', 'dispensed'], default: 'pending' },
    dispensedItems: [{
      medicineId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
      medicineName: { type: String, trim: true },
      quantity:     { type: Number, required: true, min: 1 },
      dispensedAt:  { type: Date, default: Date.now },
      dispensedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ visitId: 1 });

// Older records used only `isCancelled`. Normalize them when hydrated without
// mutating the stored document or requiring a migration.
prescriptionSchema.pre('init', function normalizeLegacyStatus(data) {
  if (!data.status) data.status = data.isCancelled ? 'cancelled' : 'active';
});

const IMMUTABLE_CLINICAL_PATHS = [
  'visitId',
  'appointmentId',
  'patientId',
  'prescribedBy',
  'medications',
  'notes',
  'diagnosis',
  'clinicalNote',
  'createdBy',
];

prescriptionSchema.pre('save', function protectClinicalContent(next) {
  if (
    !this.isNew
    && IMMUTABLE_CLINICAL_PATHS.some((path) => this.isModified(path))
  ) {
    return next(new Error('Prescription clinical content is immutable; create a new prescription instead'));
  }
  return next();
});

const rejectHardDelete = function rejectHardDelete(next) {
  next(new Error('Prescription records cannot be hard-deleted; cancel or archive them instead'));
};

prescriptionSchema.pre('deleteOne', { document: true, query: false }, rejectHardDelete);
prescriptionSchema.pre('deleteOne', { document: false, query: true }, rejectHardDelete);
prescriptionSchema.pre('deleteMany', rejectHardDelete);
prescriptionSchema.pre('findOneAndDelete', rejectHardDelete);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
