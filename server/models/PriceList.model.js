import mongoose from 'mongoose';

const priceListSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    serviceName: { type: String, trim: true },
    serviceCode: { type: String, trim: true, uppercase: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'lab', 'imaging', 'room', 'medication', 'surgery', 'pharmacy', 'other'],
      required: true,
    },
    price:    { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'AZN' },
    serviceSlug: { type: String, trim: true, lowercase: true, default: '' },
    serviceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
    isActive: { type: Boolean, default: true },

    /* ── Dynamic detail-page content (admin-editable, public test detail page) ──── */
    slug:             { type: String, trim: true, lowercase: true, default: '' },
    shortDescription: { type: String, trim: true, default: '' },

    // "Test haqqında" tab
    aboutIntro:    { type: String, trim: true, default: '' },
    aboutFeatures: { type: [String], default: [] },
    benefits:      { type: [String], default: [] },
    procedureSteps: { type: [String], default: [] },
    medicalNotice: { type: String, trim: true, default: '' },

    // "Texniki göstəricilər" tab
    technicalDetails: {
      department:        { type: String, trim: true, default: '' },
      method:             { type: String, trim: true, default: '' },
      transport:          { type: String, trim: true, default: '' },
      turnaround:         { type: String, trim: true, default: '' },
      sampleVolume:       { type: String, trim: true, default: '' },
      sampleType:         { type: String, trim: true, default: '' },
      rejectionCriteria:  { type: String, trim: true, default: '' },
      synonyms:           { type: String, trim: true, default: '' },
      preparation:        { type: String, trim: true, default: '' },
      tube:               { type: String, trim: true, default: '' },
    },

    // "Referans aralığı" tab — never auto-generated/invented numeric limits.
    referenceRange: {
      mainText:   { type: String, trim: true, default: '' },
      categories: { type: [String], default: [] },
      notice:     { type: String, trim: true, default: '' },
    },

    // Structured, parameter-level reference ranges (age/gender/method-specific),
    // admin-entered only — never auto-generated/invented numeric limits.
    referenceRanges: {
      type: [{
        parameterName: { type: String, trim: true },
        ageGroup:       { type: String, trim: true, default: '' },
        gender:         { type: String, enum: ['all', 'male', 'female'], default: 'all' },
        unit:           { type: String, trim: true, default: '' },
        minValue:       { type: String, trim: true, default: '' },
        maxValue:       { type: String, trim: true, default: '' },
        displayRange:   { type: String, trim: true, default: '' },
        note:           { type: String, trim: true, default: '' },
      }],
      default: [],
    },

    // Home-service CTA
    homeServiceAvailable:   { type: Boolean, default: false },
    homeServiceDescription: { type: String, trim: true, default: '' },

    // Expected lab-result parameters for this test (e.g. allergen panel rows) —
    // used to pre-fill the result-entry form; optional, empty for most tests.
    resultParameterTemplate: {
      type: [{
        parameterName:  { type: String, trim: true },
        unit:            { type: String, trim: true },
        referenceRange:  { type: String, trim: true },
      }],
      default: [],
    },

    // Enables the self-service "request test" + "check result" flow on the
    // public test-detail page (LabRequestModal + /e-netice redirect) in place
    // of the generic home-service CTA. Admin-controlled per test.
    selfRequestEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

priceListSchema.index({ serviceCode: 1 }, { unique: true, sparse: true });
priceListSchema.index({ slug: 1 }, { unique: true, sparse: true });
priceListSchema.index({ serviceSlug: 1, isActive: 1 });
priceListSchema.index({ serviceId: 1,   isActive: 1 });

const PriceList = mongoose.model('PriceList', priceListSchema);
export default PriceList;
