import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { addYears } from 'date-fns';

import Payment from '../models/payment.js';
import Cart from '../models/cart.js';
import CartItem from '../models/cartItem.js';
import ProductVariant from '../models/productVariant.js';
import SSLCertificate from '../models/sslCertificate.js';
import User from '../models/user.js';

import StockService from '../services/stockService.js';
import SSLCertificateService from '../services/sslCertificateService.js';
import MailService from '../services/mailService.js';
import ApiError from '../exceptions/apiError.js';

export const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) throw ApiError.BadRequest('Корзина не найдена');
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [ProductVariant],
    });
    if (!items.length) {
      throw ApiError.BadRequest('Корзина пуста');
    }
    const total = items.reduce(
      (sum, it) => sum + (it.ProductVariant?.price ?? 0) * it.quantity,
      0
    );
    if (total <= 0) {
      throw ApiError.BadRequest('Сумма к оплате должна быть больше нуля');
    }
    const payload = {
      amount: {
        value: total.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.CLIENT_URL}/payment-success`
      },
      capture: true,
      description: `Покупка SSL (userId=${userId})`
    };
    const { data } = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      payload,
      {
        auth: {
          username: process.env.YOO_KASSA_SHOP_ID,
          password: process.env.YOO_KASSA_SECRET_KEY
        },
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': uuidv4()
        }
      }
    );

    const { id: paymentId, confirmation, status } = data;

    await Payment.create({
      paymentId,
      userId,
      amount: total.toFixed(2),
      status
    });

    const domains = req.body.domains || {};
    const issuedCerts = [];
    for (const it of items) {
      const variantId = it.variantId;
      const domain = domains[variantId] || 'example.com';

      const stock = await StockService.popFree(variantId);
      if (!stock) {
        throw ApiError.BadRequest(`Нет свободных сертификатов для варианта ${variantId}`);
      }

      const ssl = await SSLCertificate.create({
        userId,
        variantId,
        domain,
        serial: nanoid(16),
        validFrom: new Date(),
        validTo: addYears(new Date(), 1),
        issuer: stock.ProductVariant?.ca ?? 'Unknown CA',
        certificatePem: stock.certificatePem,
        privateKeyPem: stock.privateKeyPem,
        caBundlePem: stock.caBundlePem,
        status: 'active'
      });

      const finalized = await SSLCertificateService.bundleAndIssue(ssl.id, {
        certificatePem: stock.certificatePem,
        privateKeyPem: stock.privateKeyPem,
        caBundlePem: stock.caBundlePem
      });

      await StockService.markUsed(stock.id, ssl.id);

      issuedCerts.push(finalized);
    }

    const user = await User.findByPk(userId);
    if (user?.email) {
      const mailItems = issuedCerts.map(cert => ({
        domain: cert.domain,
        validTo: cert.validTo
      }));
      const profileUrl = `${process.env.CLIENT_URL}/profile`;
      await MailService.sendPurchaseMail(user.email, mailItems, profileUrl);
    }

    return res.json({ payment_url: confirmation.confirmation_url });
  } catch (e) {
    next(e);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw ApiError.Forbidden('Нет доступа');
    }
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (e) {
    next(e);
  }
};

export const getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(payments);
  } catch (e) {
    next(e);
  }
};
