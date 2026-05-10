import DischargeSummary from '../../models/DischargeSummary.model.js';
import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';
import { createDischargePDF } from '../../utils/generatePDF.js';
import { uploadBuffer } from '../../config/cloudinary.js';
import { VISIT_STATUS } from '../../config/constants.js';

export const createDischargeSummary = async (data, dischargingDoctor) => {
  // 1. Create the DischargeSummary document
  const summary = await DischargeSummary.create({ ...data, dischargingDoctor });

  // 2. Generate PDF buffer
  const pdfBuffer = await createDischargePDF({ ...summary.toObject(), ...data });

  // 3. Upload to Cloudinary and persist the URL
  const pdfUrl = await uploadBuffer(pdfBuffer, {
    folder: 'discharge-summaries',
    resource_type: 'raw',
    public_id: `discharge_${summary._id}`,
  });

  summary.pdfUrl = pdfUrl;
  await summary.save();

  // 4. Close the linked Visit
  await Visit.findByIdAndUpdate(data.visitId, { status: VISIT_STATUS.CLOSED, dischargeId: summary._id });

  return summary;
};

export const getDischargeSummaryById = async (id) => {
  const summary = await DischargeSummary.findById(id)
    .populate('patientId', 'patientId')
    .populate('dischargingDoctor', 'specialization');
  if (!summary) throw new ApiError(404, 'Discharge summary not found');
  return summary;
};
