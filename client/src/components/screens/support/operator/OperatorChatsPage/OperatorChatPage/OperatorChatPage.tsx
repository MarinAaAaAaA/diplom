
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { socket } from '../../../../../../socket/socket';
import ChatService from '../../../../../../services/ChatService';
import ChatApiService from '../../../../../../services/ChatApiService';
import toast from 'react-hot-toast';
import styles from './OperatorChatPage.module.css';

export default function OperatorChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    ChatApiService.fetchOperatorChat(chatId)
      .then(({ data }) => {
        setMessages(data.messages);
        setPurchases(data.purchases);
        ChatService.joinChat(chatId);
      })
      .catch(console.error);

    const offMsg = ChatService.onMessage(msg => {
      setMessages(ms => {
        const idx = ms.findIndex(m =>
          String(m.id).startsWith('tmp-') &&
          m.sender === msg.sender &&
          m.content === msg.content
        );
        if (idx !== -1) {
          const copy = [...ms];
          copy[idx] = msg;
          return copy;
        }
        if (ms.some(m => m.id === msg.id)) {
          return ms;
        }
        return [...ms, msg];
      });
    });

    const offClose = ChatService.onChatClosed(({ chatId: closedId }) => {
      if (closedId === chatId) {
        toast.success('Чат завершён');
      }
    });

    return () => {
      offMsg();
      offClose();
      socket.off('message');
      socket.off('chatClosed');
    };
  }, [chatId]);


  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = e => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !chatId) return;

    const tmpId = `tmp-${Date.now()}`;
    setMessages(ms => [
      ...ms,
      { id: tmpId, chatId, sender: 'operator', content: text }
    ]);

    ChatApiService.operatorSendMessage(chatId, text)
      .catch(console.error);

    setInput('');
  };

  const handleClose = () => {
    if (!chatId) return;
    ChatApiService.closeOperatorChat(chatId).catch(console.error);
    ChatService.closeChat(chatId);
  };

  return (
    <div className={styles.wrap}>
      <h2>Чат #{chatId}</h2>
      <button onClick={handleClose} className={styles.closeBtn}>
        Завершить заявку
      </button>

      <div ref={chatRef} className={styles.chatWindow}>
        {messages.map(m => (
          <div
            key={m.id}
            className={m.sender === 'operator' ? styles.msgOp : styles.msgUser}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className={styles.form}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ваш ответ..."
        />
        <button type="submit">Отправить</button>
      </form>

      <section className={styles.purchases}>
        <h3>История покупок</h3>
        {purchases.length === 0 ? (
          <p>Нет покупок.</p>
        ) : (
          purchases.map(p => (
            <div key={p.id} className={styles.purchaseItem}>
              <span>
                {p.domain} до {new Date(p.validTo).toLocaleDateString()}
              </span>
              <a
                href={`${import.meta.env.VITE_BASE_URL}${p.downloadUrl}`}
                download
              >
                Скачать ZIP
              </a>
            </div>
          ))
        )}
      </section>
    </div>
  );
}