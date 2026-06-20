import Medicine from '../../models/Medicine.model.js';
import StockTransaction from '../../models/StockTransaction.model.js';
import Prescription from '../../models/Prescription.model.js';
import ApiError from '../../utils/ApiError.js';

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

const withLowStockFlag = (med) => ({
  ...med.toObject(),
  lowStockAlert: med.stock <= med.minStockLevel,
  outOfStock:    med.stock === 0,
});

// ─── Medicine CRUD ────────────────────────────────────────────────────────────

export const addMedicine = async (data) => {
  const existing = await Medicine.findOne({ name: data.name });
  if (existing) throw new ApiError(409, 'Medicine name already exists');
  // Normalise frontend field aliases
  const payload = { ...data };
  if (payload.quantity     !== undefined && payload.stock         === undefined) payload.stock         = Number(payload.quantity);
  if (payload.minStock     !== undefined && payload.minStockLevel === undefined) payload.minStockLevel = Number(payload.minStock);
  delete payload.quantity;
  delete payload.minStock;
  return Medicine.create(payload);
};

export const getMedicines = async ({ category, isActive, lowStock, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (category)             filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
  if (lowStock === 'true')  filter.$expr = { $lte: ['$stock', '$minStockLevel'] };

  const [medicines, total] = await Promise.all([
    Medicine.find(filter).sort({ name: 1 }).skip(skip).limit(lim),
    Medicine.countDocuments(filter),
  ]);
  const items = medicines.map(withLowStockFlag);
  return { items, medicines: items, total, page: pg, limit: lim };
};

export const getMedicineById = async (id) => {
  const med = await Medicine.findById(id);
  if (!med) throw new ApiError(404, 'Medicine not found');
  return withLowStockFlag(med);
};

export const updateMedicine = async (id, data) => {
  const allowed = ['genericName', 'category', 'unit', 'minStockLevel', 'unitPrice', 'manufacturer', 'expiryDate', 'description', 'isActive'];
  const safe = {};
  for (const key of allowed) if (data[key] !== undefined) safe[key] = data[key];

  const med = await Medicine.findByIdAndUpdate(id, safe, { new: true, runValidators: true });
  if (!med) throw new ApiError(404, 'Medicine not found');
  return withLowStockFlag(med);
};

// ─── Stock operations ─────────────────────────────────────────────────────────

const requirePositiveQuantity = (quantity) => {
  const n = Number(quantity);
  if (!Number.isFinite(n) || n <= 0) throw new ApiError(400, 'Quantity must be a positive number');
  return Math.trunc(n);
};

export const stockIn = async (medicineId, { quantity, reason, note }, userId) => {
  const qty = requirePositiveQuantity(quantity);
  reason = reason || note || 'Stok girişi';

  // Atomic increment — avoids a lost update if two stock-in requests race.
  const medicine = await Medicine.findByIdAndUpdate(
    medicineId,
    { $inc: { stock: qty } },
    { new: true },
  );
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  const previousStock = medicine.stock - qty;

  const transaction = await StockTransaction.create({
    medicineId, type: 'stock_in', quantity: qty, previousStock, newStock: medicine.stock, reason, performedBy: userId,
  });
  return { medicine: withLowStockFlag(medicine), transaction };
};

export const stockOut = async (medicineId, { quantity, reason, note }, userId) => {
  const qty = requirePositiveQuantity(quantity);
  reason = reason || note || 'Stok çıxışı';

  // Conditional atomic decrement — only matches (and decrements) when enough
  // stock is currently available, so two concurrent requests can't both pass
  // a check-then-set race and drive stock negative.
  const medicine = await Medicine.findOneAndUpdate(
    { _id: medicineId, stock: { $gte: qty } },
    { $inc: { stock: -qty } },
    { new: true },
  );
  if (!medicine) {
    const exists = await Medicine.findById(medicineId).select('stock name');
    if (!exists) throw new ApiError(404, 'Medicine not found');
    throw new ApiError(400, `Insufficient stock. Available: ${exists.stock}`);
  }
  const previousStock = medicine.stock + qty;

  const transaction = await StockTransaction.create({
    medicineId, type: 'stock_out', quantity: qty, previousStock, newStock: medicine.stock, reason, performedBy: userId,
  });
  const lowStockAlert = medicine.stock <= medicine.minStockLevel;
  return { medicine: withLowStockFlag(medicine), transaction, lowStockAlert };
};

export const dispenseMedicines = async (prescriptionId, items, userId) => {
  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) throw new ApiError(404, 'Prescription not found');

  // Pre-check all items (best-effort UX; the atomic decrement in stockOut below
  // is what actually prevents a race from driving stock negative)
  for (const item of items) {
    const qty = requirePositiveQuantity(item.quantity);
    const med = await Medicine.findById(item.medicineId);
    if (!med) throw new ApiError(404, `Medicine ${item.medicineId} not found`);
    if (med.stock < qty) {
      throw new ApiError(400, `Insufficient stock for ${med.name}. Available: ${med.stock}`);
    }
  }

  // Process all stock-outs
  const dispensed = [];
  for (const item of items) {
    const result = await stockOut(item.medicineId, { quantity: item.quantity, reason: `Dispensed for prescription ${prescriptionId}` }, userId);
    result.transaction.prescriptionId = prescriptionId;
    await result.transaction.save();
    dispensed.push({ medicineId: item.medicineId, quantity: item.quantity, medicineName: result.medicine.name });
  }

  return { dispensed, totalItems: dispensed.length };
};

// ─── Low stock & stats ────────────────────────────────────────────────────────

export const getLowStockMedicines = async () => {
  const medicines = await Medicine.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$minStockLevel'] },
  }).sort({ stock: 1 });

  return medicines.map((med) => ({
    ...med.toObject(),
    urgency:      med.stock === 0 ? 'critical' : 'low',
    lowStockAlert: true,
    outOfStock:    med.stock === 0,
  }));
};

export const getStockTransactions = async (medicineId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const [transactions, total] = await Promise.all([
    StockTransaction.find({ medicineId })
      .populate('performedBy', 'fullName role')
      .sort({ createdAt: -1 }).skip(skip).limit(lim),
    StockTransaction.countDocuments({ medicineId }),
  ]);
  return { transactions, total, page: pg, limit: lim };
};

export const getInventoryStats = async () => {
  const [totalMedicines, lowStockCount, outOfStockCount, valueAgg] = await Promise.all([
    Medicine.countDocuments({ isActive: true }),
    Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStockLevel'] } }),
    Medicine.countDocuments({ isActive: true, stock: 0 }),
    Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$unitPrice'] } } } },
    ]),
  ]);
  return {
    totalMedicines,
    lowStockCount,
    outOfStockCount,
    totalStockValue: +(valueAgg[0]?.totalValue ?? 0).toFixed(2),
  };
};
