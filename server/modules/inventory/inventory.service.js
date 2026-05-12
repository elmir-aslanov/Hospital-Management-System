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
  return Medicine.create(data);
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
  return { medicines: medicines.map(withLowStockFlag), total, page: pg, limit: lim };
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

export const stockIn = async (medicineId, { quantity, reason }, userId) => {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) throw new ApiError(404, 'Medicine not found');

  const previousStock = medicine.stock;
  const newStock      = previousStock + quantity;
  medicine.stock      = newStock;
  await medicine.save();

  const transaction = await StockTransaction.create({
    medicineId, type: 'stock_in', quantity, previousStock, newStock, reason, performedBy: userId,
  });
  return { medicine: withLowStockFlag(medicine), transaction };
};

export const stockOut = async (medicineId, { quantity, reason }, userId) => {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  if (medicine.stock < quantity) throw new ApiError(400, `Insufficient stock. Available: ${medicine.stock}`);

  const previousStock = medicine.stock;
  const newStock      = previousStock - quantity;
  medicine.stock      = newStock;
  await medicine.save();

  const transaction = await StockTransaction.create({
    medicineId, type: 'stock_out', quantity, previousStock, newStock, reason, performedBy: userId,
  });
  const lowStockAlert = newStock <= medicine.minStockLevel;
  return { medicine: withLowStockFlag(medicine), transaction, lowStockAlert };
};

export const dispenseMedicines = async (prescriptionId, items, userId) => {
  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) throw new ApiError(404, 'Prescription not found');

  // Pre-check all items
  for (const item of items) {
    const med = await Medicine.findById(item.medicineId);
    if (!med) throw new ApiError(404, `Medicine ${item.medicineId} not found`);
    if (med.stock < item.quantity) {
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
