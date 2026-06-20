import Medicine from '../../models/Medicine.model.js';
import StockTransaction from '../../models/StockTransaction.model.js';
import Prescription from '../../models/Prescription.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { createNotification } from '../notifications/notifications.service.js';

const LOW_STOCK_RECIPIENT_ROLES = ['ADMIN', 'SUPER_ADMIN', 'NURSE'];

// Called after every stock-changing operation. Sends one alert per "low
// streak" (claimed atomically via lowStockNotifiedAt, so concurrent stock
// operations can't double-send) and resets the guard once stock recovers
// above minStockLevel so a future drop alerts again.
const checkLowStockAlert = async (medicine) => {
  if (!medicine) return;
  const isLow = medicine.stock <= medicine.minStockLevel;

  if (isLow && !medicine.lowStockNotifiedAt) {
    const claimed = await Medicine.findOneAndUpdate(
      { _id: medicine._id, lowStockNotifiedAt: null },
      { $set: { lowStockNotifiedAt: new Date() } },
    );
    if (!claimed) return; // another concurrent operation already claimed it

    const recipients = await User.find({ role: { $in: LOW_STOCK_RECIPIENT_ROLES }, isActive: true }).select('_id');
    const title   = medicine.stock === 0 ? 'Stok tükənib' : 'Stok azdır';
    const message = `${medicine.name}: stok ${medicine.stock} ${medicine.unit} (minimum: ${medicine.minStockLevel} ${medicine.unit})`;
    await Promise.all(recipients.map((u) => createNotification({
      userId: u._id, title, message, type: 'inventory', link: '/admin/inventory',
    })));
  } else if (!isLow && medicine.lowStockNotifiedAt) {
    await Medicine.updateOne({ _id: medicine._id }, { $set: { lowStockNotifiedAt: null } });
  }
};

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
  const medicine = await Medicine.create(payload);
  try { await checkLowStockAlert(medicine); } catch (_) {}
  return medicine;
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
  // minStockLevel may have changed — re-evaluate the low-stock guard either way.
  try { await checkLowStockAlert(med); } catch (_) {}
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
  try { await checkLowStockAlert(medicine); } catch (_) {}
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
  try { await checkLowStockAlert(medicine); } catch (_) {}
  return { medicine: withLowStockFlag(medicine), transaction, lowStockAlert };
};

export const dispenseMedicines = async (prescriptionId, items, userId) => {
  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  if (prescription.status !== 'active') {
    throw new ApiError(400, `Cannot dispense a prescription with status '${prescription.status}'`);
  }
  if (prescription.dispensingStatus === 'dispensed') {
    throw new ApiError(409, 'Prescription has already been fully dispensed');
  }

  // Remaining-quantity cap, by matching dispensed medicine name against the
  // prescribed medication name — prescriptions don't carry a medicineId link,
  // only a free-text drug name, so name is the only join key available.
  const norm = (s) => (s || '').trim().toLowerCase();
  const alreadyDispensedByName = {};
  for (const d of prescription.dispensedItems) {
    const key = norm(d.medicineName);
    alreadyDispensedByName[key] = (alreadyDispensedByName[key] || 0) + d.quantity;
  }

  // Pre-check all items (best-effort UX; the atomic decrement in stockOut below
  // is what actually prevents a race from driving stock negative)
  const meds = [];
  for (const item of items) {
    const qty = requirePositiveQuantity(item.quantity);
    const med = await Medicine.findById(item.medicineId);
    if (!med) throw new ApiError(404, `Medicine ${item.medicineId} not found`);
    if (med.stock < qty) {
      throw new ApiError(400, `Insufficient stock for ${med.name}. Available: ${med.stock}`);
    }

    const prescribedLine = prescription.medications.find((m) => norm(m.name) === norm(med.name));
    if (prescribedLine?.quantity) {
      const already = alreadyDispensedByName[norm(med.name)] || 0;
      const remaining = prescribedLine.quantity - already;
      if (qty > remaining) {
        throw new ApiError(400, `Cannot dispense ${qty} of ${med.name}; only ${Math.max(0, remaining)} remain on this prescription`);
      }
    }
    meds.push(med);
  }

  // Process all stock-outs
  const dispensed = [];
  for (const item of items) {
    const result = await stockOut(item.medicineId, { quantity: item.quantity, reason: `Dispensed for prescription ${prescriptionId}` }, userId);
    result.transaction.prescriptionId = prescriptionId;
    await result.transaction.save();
    dispensed.push({ medicineId: item.medicineId, quantity: item.quantity, medicineName: result.medicine.name });
  }

  // Record on the prescription (kept separate from the immutable `medications`
  // path) and derive the overall dispensing status.
  prescription.dispensedItems.push(...dispensed.map((d) => ({
    medicineId: d.medicineId, medicineName: d.medicineName, quantity: d.quantity, dispensedAt: new Date(), dispensedBy: userId,
  })));

  const totalsByName = {};
  for (const d of prescription.dispensedItems) {
    const key = norm(d.medicineName);
    totalsByName[key] = (totalsByName[key] || 0) + d.quantity;
  }
  const namedMeds = prescription.medications.filter((m) => m.quantity);
  const allFulfilled = namedMeds.length > 0 && namedMeds.every((m) => (totalsByName[norm(m.name)] || 0) >= m.quantity);
  prescription.dispensingStatus = allFulfilled ? 'dispensed' : 'partially_dispensed';

  await Prescription.updateOne(
    { _id: prescriptionId },
    { $set: { dispensedItems: prescription.dispensedItems, dispensingStatus: prescription.dispensingStatus } },
  );

  return { dispensed, totalItems: dispensed.length, dispensingStatus: prescription.dispensingStatus };
};

// ─── Pharmacy dispensing queue ─────────────────────────────────────────────────

export const getPendingDispenseQueue = async ({ page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { status: 'active', dispensingStatus: { $in: ['pending', 'partially_dispensed'] } };
  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .populate({ path: 'prescribedBy', populate: { path: 'userId', select: 'fullName' } })
      .sort({ createdAt: -1 }).skip(skip).limit(lim),
    Prescription.countDocuments(filter),
  ]);
  return { prescriptions, total, page: pg, limit: lim };
};

export const getPrescriptionDispenseDetail = async (prescriptionId) => {
  const prescription = await Prescription.findById(prescriptionId)
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
    .populate('dispensedItems.dispensedBy', 'fullName');
  if (!prescription) throw new ApiError(404, 'Prescription not found');

  const norm = (s) => (s || '').trim().toLowerCase();
  const dispensedByName = {};
  for (const d of prescription.dispensedItems) {
    const key = norm(d.medicineName);
    dispensedByName[key] = (dispensedByName[key] || 0) + d.quantity;
  }
  const medications = prescription.medications.map((m) => ({
    ...m.toObject(),
    dispensedQuantity: dispensedByName[norm(m.name)] || 0,
    remainingQuantity: m.quantity ? Math.max(0, m.quantity - (dispensedByName[norm(m.name)] || 0)) : null,
  }));

  return { ...prescription.toObject(), medications };
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
