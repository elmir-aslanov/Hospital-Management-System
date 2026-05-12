import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as inventoryService from './inventory.service.js';

export const addMedicine       = asyncHandler(async (req, res) => { res.status(201).json(new ApiResponse(201, await inventoryService.addMedicine(req.body), 'Medicine added')); });
export const getMedicines      = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await inventoryService.getMedicines(req.query))); });
export const getMedicineById   = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await inventoryService.getMedicineById(req.params.id))); });
export const updateMedicine    = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await inventoryService.updateMedicine(req.params.id, req.body), 'Medicine updated')); });
export const getLowStockMedicines = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await inventoryService.getLowStockMedicines())); });
export const getInventoryStats = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await inventoryService.getInventoryStats())); });
export const getStockTransactions = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await inventoryService.getStockTransactions(req.params.id, req.query))); });

export const stockIn = asyncHandler(async (req, res) => {
  const result = await inventoryService.stockIn(req.params.id, req.body, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Stock updated'));
});

export const stockOut = asyncHandler(async (req, res) => {
  const result = await inventoryService.stockOut(req.params.id, req.body, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Stock updated'));
});

export const dispenseMedicines = asyncHandler(async (req, res) => {
  const result = await inventoryService.dispenseMedicines(req.body.prescriptionId, req.body.items, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Medicines dispensed'));
});
