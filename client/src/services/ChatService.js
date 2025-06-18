// src/services/ChatService.js
import { socket } from '../socket/socket';

class ChatService {
  joinedRooms = new Set();

  #join(id) {
    if (!this.joinedRooms.has(id)) {
      socket.emit('joinChat', { chatId: id });
      this.joinedRooms.add(id);
    }
  }

  joinChat(chatId) { this.#join(chatId); }
  ensureJoined(chatId) { this.#join(chatId); }

  sendUserMessage(content) { socket.emit('userMessage', { content }); }
  sendOperatorMessage(chatId, text) { this.#join(chatId); socket.emit('operatorMessage', { chatId, content: text }); }
  closeChat(chatId) { socket.emit('closeChat', { chatId }); }

  onMessage(cb) { socket.on('message', cb); return () => socket.off('message', cb); }
  onNewChat(cb) { socket.on('newChat', cb); return () => socket.off('newChat', cb); }
  onChatClosed(cb) { socket.on('chatClosed', cb); return () => socket.off('chatClosed', cb); }
  onChatUpdated(cb) { socket.on('chatUpdated', cb); return () => socket.off('chatUpdated', cb); }

  joinOperators() {
    socket.emit('joinRoom', { room: 'operators' });
  }
}

export default new ChatService();
