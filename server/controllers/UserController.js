import { validationResult } from 'express-validator';
import UserService from '../services/userService.js';
import ApiError from '../exceptions/apiError.js';
import { checkInnExists } from '../utils/innLookup.js';
import jwt from 'jsonwebtoken';

export const registration = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Ошибки валидации:', errors.array());
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
        }

        const { email, inn, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return next(ApiError.BadRequest('Пароли не совпадают'));
        }

        const org = await checkInnExists(inn);
            if (!org) {
                return next(ApiError.BadRequest('Компания с таким ИНН не найдена или ликвидирована'));
        }

        const userData = await UserService.registration(email, inn, password);
        return res.json({
            message: 'Пользователь успешно зарегистрирован. Проверьте почту для активации.'
        });
    } catch (e) {
        next(e);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userData = await UserService.login(email, password);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.json(userData);
    } catch (e) {
        next(e);
    }
};

export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        const token = await UserService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    } catch (e) {
        next(e);
    }
};

export const activate = async (req, res, next) => {
    try {
        const activationLink = req.params.link;
        await UserService.activate(activationLink);
        return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
        next(e);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        const userData = await UserService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.json(userData);
    } catch (e) {
        next(e);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        return res.json(users);
    } catch (e) {
        next(e);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);

        return res.json(user);
    } catch (e) {
        next(e);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        const user = await UserService.getUserById(id);

        const isOldPasswordCorrect = await UserService.comparePasswords(oldPassword, user.password);

        if (!isOldPasswordCorrect) {
            throw ApiError.BadRequest('Неверный старый пароль');
        }

        await UserService.updateUserPassword(id, newPassword);

        return res.json({ message: 'Пароль успешно изменен' });
    } catch (e) {
        next(e);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь с таким email не найден' });
      }

      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
      await mailService.sendResetPasswordMail(
        email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      );
      return res.json({ message: 'Ссылка для сброса пароля отправлена на почту' });
    } catch (error) {
      next(error);
    }
  };

  export const resetPassword = async (req, res, next) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Пароли не совпадают' });
      }
      const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
      const user = await UserService.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      await UserService.updateUserPassword(user.id, newPassword);
      return res.json({ message: 'Пароль успешно изменён' });
    } catch (error) {
      next(error);
    }
};

