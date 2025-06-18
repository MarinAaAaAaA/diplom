import SSLCertificateService from '../services/sslCertificateService.js';
import ApiError from '../exceptions/apiError.js';
import SSLCertificate from '../models/sslCertificate.js';
import User from '../models/user.js';
import ProductVariant from '../models/productVariant.js';

export const listPending = async (_req, res, next) => {
    try {
        const list = await SSLCertificateService.getAll({
            where: { status: 'active', certificatePem: null }
        });
        res.json(list);
    } catch (e) { next(e); }
};

export const uploadCert = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return next(ApiError.UnauthorizedError());

        const { certId } = req.params;
        if (!req.files) return next(ApiError.BadRequest('Файлы не переданы'));

        const updated = await SSLCertificateService.attachFiles(certId, req.files);
        res.json(updated);
    } catch (e) { next(e); }
};

export async function listPurchases(req, res, next) {
  if (req.user.role !== 'admin') return next(ApiError.UnauthorizedError());

  const list = await SSLCertificate.findAll({
    include: [
      { model: User,            attributes: ['email', 'id'] },
      { model: ProductVariant,  attributes: ['name'] }
    ],
    order: [['createdAt','DESC']],
  });
  res.json(list);
}
