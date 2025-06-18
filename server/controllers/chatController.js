import ChatService from '../services/chatService.js';
import PurchaseService from '../services/PurchaseService.js';
import ApiError from '../exceptions/apiError.js';

export const userSendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    const { chat } = await ChatService.ensureChat(userId, true);

    await ChatService.addMessage(chat.id, 'user', userId, content);

    if (chat.status === 'register') {
      await ChatService.addMessage(chat.id, 'operator', null, ChatService.autoAck());
    }

    res.json({ chatId: chat.id });
  } catch (e) { next(e); }
};

export const getUserChatMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const { chat } = await ChatService.ensureChat(userId, false);
    if (!chat || chat.id !== Number(chatId))
      return next(ApiError.UnauthorizedError());

    const msgs = await chat.getMessages({ order: [['created_at', 'ASC']] });
    res.json(msgs);
  } catch (e) { next(e); }
};

export const listOperatorChats = (_req, res, next) => {
  ChatService.listOperatorChats()
    .then(res.json.bind(res))
    .catch(next);
};

export const openOperatorChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await ChatService.openOperatorChat(chatId);

    const chat = await messages[0]?.getChat();
    const purchases = chat ? await PurchaseService.getByUser(chat.userId) : [];

    res.json({ messages, purchases });
  } catch (e) { next(e); }
};

export const operatorSendMessage = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { chatId } = req.params;
    const { content } = req.body;

    const msg = await ChatService.operatorSend(chatId, operatorId, content);
    res.json(msg);
  } catch (e) { next(e); }
};

export const closeOperatorChat = async (req, res, next) => {
  ChatService.closeChat(req.params.chatId)
    .then(res.json.bind(res))
    .catch(next);
};

export const ensureUserChat = async (req, res, next) => {
  try {
    const { chat } = await ChatService.ensureChat(req.user.id, true);
    const messages = await chat.getMessages({ order: [['created_at', 'ASC']] });
    res.json({ chatId: chat.id, messages });
  } catch (e) { next(e); }
};
