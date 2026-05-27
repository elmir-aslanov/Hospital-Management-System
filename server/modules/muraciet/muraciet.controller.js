import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import Muraciet     from './muraciet.model.js';

export const create = asyncHandler(async (req, res) => {
  const { ad, soyad, ataAdi, epoct, telefon, unvan, metn } = req.body;

  if (!ad?.trim() || !soyad?.trim() || !ataAdi?.trim() ||
      !epoct?.trim() || !telefon?.trim() || !unvan?.trim() || !metn?.trim()) {
    throw new ApiError(400, 'Bütün sahələri doldurun');
  }

  const doc = await Muraciet.create({ ad, soyad, ataAdi, epoct, telefon, unvan, metn });
  res.status(201).json(new ApiResponse(201, doc, 'Müraciət qəbul edildi'));
});

export const getAll = asyncHandler(async (req, res) => {
  const muracietler = await Muraciet.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, muracietler));
});
