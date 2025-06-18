import React, { useEffect, useState, useRef } from 'react';
import ChatApiService from '../../../../services/ChatApiService';
import ChatService    from '../../../../services/ChatService';
import styles         from './ProfileRequests.module.css';

export default function ProfileRequests() {
  const [chats, setChats]         = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [input, setInput]         = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    ChatApiService.listOperatorChats()
      .then(({ data }) => setChats(data))
      .catch(console.error);

    ChatService.joinOperators();

    const offNew    = ChatService.onNewChat(chat =>
      setChats(cs => [chat, ...cs])
    );
    const offMsg    = ChatService.onMessage(msg =>
      setChats(cs =>
        cs.map(c =>
          c.id === msg.chatId
            ? {
                ...c,
                status: msg.sender === 'operator' ? 'process' : c.status,
                Messages: [msg],
              }
            : c
        )
      )
    );
    const offUpd = ChatService.onChatUpdated(({ chatId, status, lastMessage }) =>
      setChats(cs =>
        cs.map(c =>
          c.id === chatId
            ? { ...c, status, Messages: lastMessage ? [lastMessage] : c.Messages }
            : c
        )
      )
    );
    const offClose = ChatService.onChatClosed(({ chatId }) =>
      setChats(cs =>
        cs.map(c => (c.id === chatId ? { ...c, status: 'closed' } : c))
      )
    );

    return () => {
      offNew(); offMsg(); offUpd(); offClose();
    };
  }, []);

  useEffect(() => {
    if (!currentId) return;

    ChatService.joinChat(currentId);
    ChatApiService.fetchOperatorChat(currentId)
      .then(({ data }) => {
        setMessages(data.messages);
        setPurchases(data.purchases);
      })
      .catch(console.error);
  }, [currentId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const send = e => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !currentId) return;

    setMessages(ms => [
      ...ms,
      { id: `tmp-${Date.now()}`, chatId: currentId, sender: 'operator', content: text }
    ]);
    ChatService.sendOperatorMessage(currentId, text);
    setInput('');
  };

  const finishChat = () => {
    if (!currentId) return;
    ChatApiService.closeOperatorChat(currentId).catch(console.error);
    ChatService.closeChat(currentId);
    setCurrentId(null);
  };

  const grouped = {
    register: chats.filter(c => c.status === 'register'),
    process:  chats.filter(c => c.status === 'process'),
    closed:   chats.filter(c => c.status === 'closed'),
  };

  const renderChatItem = c => {
    const last = c.Messages?.[0]?.content?.slice(0, 25) || '—';
    const active = c.id === currentId ? styles.chatItemActive : '';
    return (
      <button
        key={c.id}
        onClick={() => setCurrentId(c.id)}
        className={`${styles.chatItem} ${active}`}
      >
        <div className={styles.chatTitle}>User #{c.userId}</div>
        <div className={styles.chatPreview}>{last}</div>
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <details open>
          <summary>REGISTER ({grouped.register.length})</summary>
          {grouped.register.map(renderChatItem)}
        </details>
        <details>
          <summary>IN PROCESS ({grouped.process.length})</summary>
          {grouped.process.map(renderChatItem)}
        </details>
        <details>
          <summary>CLOSED ({grouped.closed.length})</summary>
          {grouped.closed.map(renderChatItem)}
        </details>
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
              {messages.map(m => (
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
                onChange={e => setInput(e.target.value)}
                placeholder="Ваш ответ…"
              />
              <button type="submit">Отправить</button>
            </form>

            <section className={styles.purchases}>
              <h3>История покупок</h3>
              {purchases.length === 0 ? (
                <p className={styles.empty}>Нет покупок.</p>
              ) : (
                purchases.map(p => (
                  <div key={p.id} className={styles.purchaseItem}>
                    <span>
                      {p.domain} до {new Date(p.validTo).toLocaleDateString()}
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
          <div className={styles.emptyCenter}>Выберите заявку слева</div>
        )}
      </main>
    </div>
  );
}