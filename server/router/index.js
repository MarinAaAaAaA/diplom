import express from 'express';
import { body } from 'express-validator';
import fileUpload from 'express-fileupload';

import authMiddleware from '../middlewares/authMiddleware.js';

import * as UserController from '../controllers/userController.js';
import * as ProductController from '../controllers/ProductController.js';
import * as ProductVariantController from '../controllers/ProductVariantController.js';
import * as CartController from '../controllers/CartController.js';
import * as PaymentController from '../controllers/paymentController.js';
import * as ProfileController from '../controllers/profileController.js';
import * as RenewalController from '../controllers/renewalController.js';
import * as AdminCertController from '../controllers/adminCertificateController.js';
import * as StockController from '../controllers/stockController.js';
import * as ChatController from '../controllers/chatController.js';

import integrationRouter from './integrationRouter.js';

const router = express.Router();

router.use('/integration', integrationRouter);

router.post(
  '/registration',
  body('email').isEmail(),
  body('inn').isLength({ min: 3 }),
  body('password').isLength({ min: 5 }),
  UserController.registration
);
router.post('/login', UserController.login);
router.post('/logout', authMiddleware, UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);

router.get('/users', authMiddleware, UserController.getUsers);
router.get('/users/:id', authMiddleware, UserController.getUserById);
router.post('/users/:id/change-password', authMiddleware, UserController.changePassword);

router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

router.post('/products', authMiddleware, ProductController.create);
router.get('/products', ProductController.getAll);
router.get('/products/:id', ProductController.getOne);
router.put('/products/:id', authMiddleware, ProductController.update);
router.delete('/products/:id', authMiddleware, ProductController.remove);
router.post(
  '/products/:id/upload-image',
  authMiddleware,
  ProductController.uploadImage
);

router.post('/products/:productId/variants', authMiddleware, ProductVariantController.create);
router.get('/products/:productId/variants', ProductVariantController.getByProduct);
router.post('/products/:productId/variants/:variantId/upload', authMiddleware, ProductVariantController.uploadImage);

router.get('/cart', authMiddleware, CartController.getCart);
router.post('/cart', authMiddleware, CartController.addToCart);
router.patch('/cart', authMiddleware, CartController.updateQuantity);
router.delete('/cart', authMiddleware, CartController.removeFromCart);

router.post('/payment/create', authMiddleware, PaymentController.createPayment);
router.get('/payment/history', authMiddleware, PaymentController.getUserPayments);
router.get('/payment/all', authMiddleware, PaymentController.getAllPayments);

router.get('/profile/api-key', authMiddleware, ProfileController.getApiKey);
router.post('/profile/api-key/issue', authMiddleware, ProfileController.issueApiKey);
router.post('/profile/api-key/rotate', authMiddleware, ProfileController.rotateApiKey);
router.get('/profile/ssl-certs', authMiddleware, ProfileController.getMyCertificates);
router.post('/ssl-certs/:id/renew', authMiddleware, RenewalController.renew);

router.post('/support/messages', authMiddleware, ChatController.userSendMessage);
router.get('/support/chat', authMiddleware, ChatController.ensureUserChat);
router.get('/support/chats/:chatId/messages', authMiddleware, ChatController.getUserChatMessages);

router.get('/operator/chats', authMiddleware, ChatController.listOperatorChats);
router.get('/operator/chats/:chatId/messages', authMiddleware, ChatController.openOperatorChat);
router.post('/operator/chats/:chatId/messages', authMiddleware, ChatController.operatorSendMessage);
router.post('/operator/chats/:chatId/close', authMiddleware, ChatController.closeOperatorChat);

router.get('/admin/ssl-pending', authMiddleware, AdminCertController.listPending);
router.post('/admin/ssl/:certId/upload', authMiddleware, AdminCertController.uploadCert);
router.get('/admin/purchases', authMiddleware, AdminCertController.listPurchases);

router.post('/admin/stock/:variantId/upload', authMiddleware, StockController.uploadToStock);
router.get('/admin/stock-stats', authMiddleware, StockController.getStats);

export default router;