import ApiKeyService         from '../services/apiKeyService.js';
import SSLCertificateService from '../services/sslCertificateService.js';

export const getApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKeyService.getActive(req.user.id);
    res.json({ apiKey });
  } catch (e) { next(e); }
};

export const issueApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKeyService.issue(req.user.id);
    res.json({ apiKey });
  } catch (e) { next(e); }
};

export const rotateApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKeyService.rotate(req.user.id);
    res.json({ apiKey });
  } catch (e) { next(e); }
};

export const getMyCertificates = async (req, res, next) => {
  try {
    const certs = await SSLCertificateService.getByUser(req.user.id);
    res.json(certs);
  } catch (e) { next(e); }
};
