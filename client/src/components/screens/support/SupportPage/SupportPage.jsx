import React, { useEffect, useRef, useState } from 'react';
import ChatApiService from '../../../../services/ChatApiService';
import ChatService from '../../../../services/ChatService';
import { socket } from '../../../../socket/socket';
import styles from './SupportPage.module.css';

const cx = (...cl) => cl.filter(Boolean).join(' ');

export default function SupportPage() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const chatRef = useRef(null);
  const chatIdRef = useRef(null);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await ChatApiService.ensureUserChat();
        setChatId(data.chatId);
        chatIdRef.current = data.chatId;
        setMessages(data.messages);
        ChatService.ensureJoined(data.chatId);
      } catch (e) {
        console.error('Не удалось загрузить чат поддержки:', e);
      }
    })();
  }, []);

  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);

  useEffect(() => {
    const handle = (msg) => {

      if (chatIdRef.current !== msg.chatId) {
        setChatId(msg.chatId);
        chatIdRef.current = msg.chatId;
        setMessages([]);
        ChatService.ensureJoined(msg.chatId);
      }
      setMessages(prev => {
        const idx = prev.findIndex(
          m => String(m.id).startsWith('tmp-') &&
            m.sender === msg.sender &&
            m.content === msg.content
        );
        if (idx !== -1) {
          const copy = [...prev]; copy[idx] = msg; return copy;
        }
        return prev.some(m => m.id === msg.id) ? prev : [...prev, msg];
      });
    };

    ChatService.onMessage(handle);
    return () => socket.off('message', handle);
  }, []);


  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // optimistic bubble
    setMessages(prev => [
      ...prev,
      { id: `tmp-${Date.now()}`, chatId: chatIdRef.current, sender: 'user', content: text }
    ]);

    ChatService.sendUserMessage(text);
    setInput('');
  };

  return (
    <div className={styles.desk}>
      <div ref={chatRef} className={styles.chatWindow}>
        {messages.map(m => (
          <div
            key={m.id}
            className={cx(
              styles.msg,
              m.sender === 'user' ? styles.msgSelf : styles.msgOther
            )}
          >
            {m.content}
          </div>
        ))}

        {messages.length === 0 && (
          <p className={styles.placeholder}>Начните диалог со службой поддержки…</p>
        )}
      </div>

      <form onSubmit={send} className={styles.form}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ваше сообщение…"
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}