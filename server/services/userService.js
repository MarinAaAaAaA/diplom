import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import mailService from './mailService.js';
import tokenService from './tokenService.js';
import UserDto from '../dtos/userDto.js';
import ApiError from '../exceptions/apiError.js';
import User from '../models/user.js';

class UserService {
    async registration(email, inn, password, role = 'member') {
        const candidate = await User.findOne({ where: { email } });
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const activationLink = uuidv4();
        const user = await User.create({
            email,
            inn,
            password: hashPassword,
            activationLink,
            role,
        });

        await mailService.sendActivationMail(
            email,
            `${process.env.API_URL}/api/activate/${activationLink}`
        );
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }

    async activate(activationLink) {
        const user = await User.findOne({ where: { activationLink } });
        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await User.findByPk(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }

    async getAllUsers() {
        const users = await User.findAll();
        return users;
    }

    async getUserById(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw ApiError.NotFound(`Пользователь с ID ${id} не найден`);
        }
        return user;
    }

    async comparePasswords(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    async updateUserPassword(id, newPassword) {
        const user = await this.getUserById(id);
        const hashedNewPassword = await this.hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();
    }

    async updateAvatarUrl(userId, avatarUrl) {
        const user = await this.getUserById(userId);
        user.avatarUrl = avatarUrl;
        await user.save();
    }

    async getAvatarUrl(userId) {
        const user = await this.getUserById(userId);
        return user.avatarUrl;
    }
}

export default new UserService();
