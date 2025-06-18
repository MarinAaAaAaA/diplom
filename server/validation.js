import { body } from 'express-validator';
import { isInnLegalValid } from '../utils/innValidator.js';

export const registerValidation = [
  body('email').isEmail().withMessage('Некорректный e‑mail'),

  body('inn')
    .custom((value) => isInnLegalValid(value))
    .withMessage('ИНН указан неверно (проверьте контрольную цифру)'),

  body('password')
    .isLength({ min: 5 })
    .withMessage('Пароль должен быть не короче 5 символов'),
];