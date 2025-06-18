import StockService from '../services/stockService.js';
import ApiError     from '../exceptions/apiError.js';

export async function uploadToStock(req, res, next) {
  try {
    if (req.user.role !== 'admin')
      return next(ApiError.UnauthorizedError());

    const { variantId } = req.params;
    if (!req.files)
      return next(ApiError.BadRequest('Файлы не переданы'));

    const added = await StockService.add(variantId, req.files);
    res.json(added);

  } catch (e) { next(e); }
}

export async function getStats(req, res, next) {
  try {
    if (req.user.role !== 'admin')
      return next(ApiError.UnauthorizedError());

    const data = await StockService.stats();
    res.json(data);

  } catch (e) { next(e); }
}
