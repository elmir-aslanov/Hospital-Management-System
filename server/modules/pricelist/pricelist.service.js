import mongoose  from 'mongoose';
import PriceList from '../../models/PriceList.model.js';
import ApiError  from '../../utils/ApiError.js';

export const getPrices = async ({ category, serviceSlug, search, page = 1, limit = 50 } = {}) => {
  const filter = { isActive: true };
  if (category)    filter.category    = category;
  if (serviceSlug) filter.serviceSlug = serviceSlug;
  if (search)   filter.$or = [
    { name:        { $regex: search, $options: 'i' } },
    { serviceName: { $regex: search, $options: 'i' } },
    { serviceCode: { $regex: search, $options: 'i' } },
  ];
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(200, parseInt(limit));
  const [prices, total] = await Promise.all([
    PriceList.find(filter).sort({ category: 1, name: 1 }).skip((pg - 1) * lim).limit(lim),
    PriceList.countDocuments(filter),
  ]);
  return { prices, total, page: pg, limit: lim };
};

// Explicit allowlist — keeps the public detail response limited to fields the
// test-detail page actually renders, regardless of any other data on the document.
const DETAIL_FIELDS = [
  'name', 'slug', 'serviceCode', 'price', 'currency', 'category',
  'serviceName', 'serviceSlug', 'description', 'shortDescription',
  'aboutIntro', 'aboutFeatures', 'benefits', 'procedureSteps', 'medicalNotice',
  'technicalDetails', 'referenceRange',
  'homeServiceAvailable', 'homeServiceDescription',
  'isActive', 'createdAt', 'updatedAt',
].join(' ');

// Public test-detail lookup — accepts either a slug or a Mongo _id, normalized
// and scoped to active records only so unknown/inactive/other-test data never leaks.
export const getByIdentifier = async (rawIdentifier) => {
  const identifier = String(rawIdentifier || '').trim().toLowerCase();
  if (!identifier) throw new ApiError(404, 'Test tapılmadı');

  const filter = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier, isActive: true }
    : { slug: identifier, isActive: true };

  const doc = await PriceList.findOne(filter).select(DETAIL_FIELDS);
  if (!doc) throw new ApiError(404, 'Test tapılmadı');
  return doc;
};

export const createPrice = async (data) => PriceList.create(data);

export const updatePrice = async (id, data) => {
  const p = await PriceList.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!p) throw new ApiError(404, 'Price not found');
  return p;
};

export const deletePrice = async (id) => {
  const p = await PriceList.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!p) throw new ApiError(404, 'Price not found');
};
