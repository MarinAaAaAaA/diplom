import SSLCertificateService from '../services/sslCertificateService.js';

export const renew = async (req, res, next) => {
  try {
    const certId = req.params.id;
    const cert = await SSLCertificateService.renew(certId);
    return res.json({
      message: 'Сертификат успешно продлён',
      cert,
    });
  } catch (e) {
    next(e);
  }
};