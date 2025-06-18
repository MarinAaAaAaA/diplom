import $api from '../http';

class ChatApiService {
    static fetchOrCreateChat() {
        return $api.get('/support/chats/restore');
    }
    static sendUserMessage(content) {
        return $api.post('/support/messages', { content });
    }

    static listOperatorChats() {
        return $api.get('/operator/chats');
    }

    static fetchOperatorChat(id) {
        return $api.get(`/operator/chats/${id}/messages`);
    }

    static operatorSendMessage(id, c) {
        return $api.post(`/operator/chats/${id}/messages`, { content: c });
    }

    static closeOperatorChat(id) {
        return $api.post(`/operator/chats/${id}/close`);
    }

    static ensureUserChat() {
        return $api.get('/support/chat');
  }

  static listUserChats() {
    return $api.get('/support/chats');
  }
}

export default ChatApiService;
