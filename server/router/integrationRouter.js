import { Router } from 'express';
import apiKeyAuth from '../middlewares/apiKeyAuth.js';
import * as Integration from '../controllers/integrationController.js';

const router = new Router();
router.use(apiKeyAuth);

router.get('/clients', Integration.getClients);
router.get('/clients/:id', Integration.getClient);
router.get('/clients/:id/ssl-certs', Integration.getClientCertificates);

router.get('/ssl-certs', Integration.getCertificates);
router.get('/ssl-certs/:id', Integration.getCertificate);

export default router;
