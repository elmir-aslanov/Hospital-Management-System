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
