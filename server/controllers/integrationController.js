import UserService from '../services/userService.js';
import SSLCertificateService from '../services/sslCertificateService.js';
import ApiError from '../exceptions/apiError.js';

export const getClients = (_req, res, next) => UserService.getAllUsers()
  .then(res.json.bind(res)).catch(next);

export const getClient = (req, res, next) => UserService.getUserById(req.params.id)
  .then(res.json.bind(res)).catch(next);

export const getClientCertificates = (req, res, next) =>
  SSLCertificateService.getByUser(req.params.id)
    .then(res.json.bind(res)).catch(next);

export const getCertificates = (_req, res, next) => SSLCertificateService.getAll()
  .then(res.json.bind(res)).catch(next);

export const getCertificate = (req, res, next) =>
  SSLCertificateService.getById(req.params.id)
    .then(cert => cert ? res.json(cert) : Promise.reject(ApiError.NotFound('Сертификат не найден')))
    .catch(next);
