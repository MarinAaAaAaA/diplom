import { Op }     from 'sequelize';
import Chat       from '../models/chat.js';
import Message    from '../models/message.js';
import ApiError   from '../exceptions/apiError.js';

class ChatService {
  /* ------------------------------------------------- helpers */
  /** активный (register|process) чат пользователя */
  async #active(userId) {
    return Chat.findOne({
      where : { userId, status: { [Op.in]: ['register', 'process'] } },
      order : [['updated_at', 'DESC']],
    });
  }

  /** самый свежий чат (любой статус) */
  async #last(userId) {
    return Chat.findOne({
      where : { userId },
      order : [['updated_at', 'DESC']],
    });
  }

  /* ------------------------------------------------- публичное API */
  /** вернуть активный, либо null */
  async getActive(userId) {
    return this.#active(userId);
  }

  /**
   * вернуть активный; если только CLOSED — открыть его; если ничего — создать
   * @returns { chat, isReopened }
   */
  async ensureChat(userId, reopen = true) {
    // активный
    let chat = await this.#active(userId);
    if (chat) return { chat, isReopened: false };

    // переоткрываем closed
    if (reopen) {
      chat = await this.#last(userId); // последняя вообще
      if (chat) {
        chat.status = 'register';
        await chat.save();
        return { chat, isReopened: true };
      }
    }

    // fresh register
    chat = await Chat.create({ userId });
    return { chat, isReopened: false };
  }

  /** создать чат сразу с первым user-сообщением */
  async createChatWithMessage(userId, content) {
    const { chat } = await this.ensureChat(userId, false);
    await this.addMessage(chat.id, 'user', userId, content);
    return chat;
  }

  /* ------------------------------------------------- сообщения */
  async addMessage(chatId, sender, senderId, content) {
    return Message.create({ chatId, sender, senderId, content });
  }

  autoAck() {
    return 'Здравствуйте, ваша заявка принята, ожидайте.';
  }

  /* ------------------------------------------------- оператор */
  async openOperatorChat(chatId) {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw ApiError.NotFound('Чат не найден');

    if (chat.status === 'register') {
      chat.status = 'process';
      await chat.save();
    }
    return Message.findAll({ where:{ chatId }, order:[['created_at','ASC']] });
  }

  async listOperatorChats() {
    return Chat.findAll({
      include : [{
        model : Message, limit : 1, order : [['created_at','DESC']],
      }],
      order : [['updated_at','DESC']],
    });
  }

  async operatorSend(chatId, operatorId, content) {
    await this.openOperatorChat(chatId);
    return this.addMessage(chatId, 'operator', operatorId, content);
  }

  async closeChat(chatId) {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw ApiError.NotFound('Чат не найден');
    chat.status = 'closed';
    await chat.save();
    return chat;
  }
}

export default new ChatService();
