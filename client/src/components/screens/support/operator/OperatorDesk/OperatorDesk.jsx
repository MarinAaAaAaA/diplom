import React, { useEffect, useRef, useState } from 'react';
import ChatApiService from '../../../../../services/ChatApiService';
import ChatService from '../../../../../services/ChatService';
import styles from './OperatorDesk.module.css';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../../../index';


export default function OperatorDesk() {
  const { store } = useContext(Context);
  const [chats, setChats] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  const navigate  = useNavigate();

  useEffect(() => {
    if (!store.isAuth) {
      navigate('/auth/login', { replace: true });
    } else if (!['operator','admin'].includes(store.user.role)) {
      navigate('/', { replace: true });
    }
  }, [store.isAuth, store.user.role, navigate]);
  const loadChats = async () => {
    const { data } = await ChatApiService.listOperatorChats();
    setChats(data);
  };

  const openChat = async (id) => {
    if (id === currentId) return;
    setChats((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: 'process' } : c))
    );

    ChatService.joinChat(id);

    setCurrentId(id);
    setMessages([]);
    setPurchases([]);

    try {
      const { data } = await ChatApiService.fetchOperatorChat(id);
      setMessages(data.messages);
      setPurchases(data.purchases);
    } catch (err) {
      console.error('openChat error:', err);
    }
  };

  useEffect(() => {
    ChatService.joinOperators();
    loadChats();
  }, []);

  useEffect(() => {
    const offNew = ChatService.onNewChat((chat) =>
      setChats((cs) => {
        const idx = cs.findIndex((c) => c.id === chat.id);
        if (idx === -1) return [chat, ...cs];
        const copy = [...cs];
        copy[idx] = { ...copy[idx], status: chat.status, Messages: chat.Messages };
        return [copy[idx], ...copy.filter((_, i) => i !== idx)];
      })
    );

    const offMsg = ChatService.onMessage((msg) => {
      setChats((cs) =>
        cs.map((c) =>
          c.id === msg.chatId
            ? {
                ...c,
                Messages: [msg],
                status:
                  msg.sender === 'operator' && msg.senderId != null
                    ? 'process'
                    : c.status,
              }
            : c
        )
      );

      if (msg.chatId === currentId) {
        setMessages((ms) => {
          const idx = ms.findIndex(
            (m) =>
              String(m.id).startsWith('tmp-') &&
              m.sender === msg.sender &&
              m.content === msg.content
          );
          if (idx !== -1) {
            const copy = [...ms];
            copy[idx] = msg;
            return copy;
          }
          return ms.some((m) => m.id === msg.id) ? ms : [...ms, msg];
        });
      }
    });

    const offClosed = ChatService.onChatClosed(({ chatId }) => {
      setChats((cs) => cs.map((c) => (c.id === chatId ? { ...c, status: 'closed' } : c)));
      if (chatId === currentId) setCurrentId(null);
    });

    const offUpd = ChatService.onChatUpdated(({ chatId, status, lastMessage }) =>
      setChats((cs) =>
        cs.map((c) =>
          c.id === chatId
            ? { ...c, status, Messages: lastMessage ? [lastMessage] : c.Messages }
            : c
        )
      )
    );

    return () => {
      offNew();
      offMsg();
      offClosed();
      offUpd();
    };
  }, [currentId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !currentId) return;

    setMessages((ms) => [
      ...ms,
      { id: `tmp-${Date.now()}`, chatId: currentId, sender: 'operator', content: text },
    ]);

    ChatService.sendOperatorMessage(currentId, text);
    setInput('');
  };

  const finishChat = () => {
    if (!currentId) return;
    ChatApiService.closeOperatorChat(currentId);
    ChatService.closeChat(currentId);
  };

  const grouped = {
    register: chats.filter((c) => c.status === 'register'),
    process: chats.filter((c) => c.status === 'process'),
    closed: chats.filter((c) => c.status === 'closed'),
  };

  const renderItem = (c) => {
    const last = c.Messages?.[0];
    return (
      <button
        key={c.id}
        onClick={() => openChat(c.id)}
        className={[styles.chatItem, c.id === currentId && styles.chatItemActive]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.chatTitle}>User #{c.userId}</div>
        {c.status === 'process' && <span className={styles.badge}>IN&nbsp;PROGRESS</span>}
        <div className={styles.chatPreview}>{last?.content?.slice(0, 25) || '—'}</div>
      </button>
    );
  };

  return (
    <div className={styles.desk}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Заявки</h2>

        <Section label="REGISTER">
          {grouped.register.length ? (
            grouped.register.map(renderItem)
          ) : (
            <span className={styles.empty}>Нет</span>
          )}
        </Section>

        <Section label="PROCESS">
          {grouped.process.length ? (
            grouped.process.map(renderItem)
          ) : (
            <span className={styles.empty}>Нет</span>
          )}
        </Section>

        <Section label="CLOSED">
          {grouped.closed.length ? (
            grouped.closed.map(renderItem)
          ) : (
            <span className={styles.empty}>Нет</span>
          )}
        </Section>
      </aside>

      <main className={styles.chatArea}>
        {currentId ? (
          <>
            <header className={styles.chatHeader}>
              Чат #{currentId}
              <button onClick={finishChat} className={styles.finishBtn}>
                Завершить
              </button>
            </header>

            <div ref={chatRef} className={styles.chatWindow}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.sender === 'operator' ? styles.msgSelf : styles.msgOther}
                >
                  {m.content}
                </div>
              ))}
            </div>

            <form onSubmit={send} className={styles.form}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ваш ответ…"
              />
              <button type="submit">Отправить</button>
            </form>

            <section className={styles.purchases}>
              <h3>История покупок</h3>
              {purchases.length === 0 ? (
                <p className={styles.empty}>Нет покупок.</p>
              ) : (
                purchases.map((p) => (
                  <div key={p.id} className={styles.purchaseItem}>
                    <span>
                      {p.domain} до&nbsp;
                      {new Date(p.validTo).toLocaleDateString()}
                    </span>
                    <a href={`${import.meta.env.VITE_BASE_URL}${p.downloadUrl}`} download>
                      Скачать ZIP
                    </a>
                  </div>
                ))
              )}
            </section>
          </>
        ) : (
          <p className={styles.emptyCenter}>Выберите заявку слева</p>
        )}
      </main>
    </div>
  );
}

const Section = ({ label, children }) => (
  <>
    <h4 className={styles.sectionTitle}>{label}</h4>
    {children}
  </>
);
