import ApiKeyService from '../services/apiKeyService.js';
import ApiError      from '../exceptions/apiError.js';

export default async function apiKeyAuth(req, _res, next) {
  const raw = req.header('X-API-KEY');
  if (!raw) return next(ApiError.UnauthorizedError());

  const user = await ApiKeyService.authenticate(raw);
  if (!user) return next(ApiError.UnauthorizedError());

  req.user = { id: user.id, role: user.role };
  next();
}
