import React, { useEffect, useState } from 'react';
import { Link }         from 'react-router-dom';
import ChatService      from '../../../../../services/ChatService';
import ChatApiService   from '../../../../../services/ChatApiService';
import styles           from './OperatorChatsPage.module.css';


export default function OperatorChatsPage() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    ChatApiService.listOperatorChats()
      .then(({ data }) => setChats(data))
      .catch(console.error);

    const offNew    = ChatService.onNewChat(chat  => setChats(cs => [chat, ...cs]));
    const offMsg    = ChatService.onMessage(msg  =>
      setChats(cs => cs.map(c =>
        c.id === msg.chatId
          ? {
              ...c,
              Messages: [msg],
              status  : msg.sender === 'operator' ? 'process' : c.status,
            }
          : c
      ))
    );
    const offClosed = ChatService.onChatClosed(({ chatId }) =>
      setChats(cs => cs.map(c =>
        c.id === chatId ? { ...c, status: 'closed' } : c
      ))
    );
    const offUpd    = ChatService.onChatUpdated(({ chatId, status, lastMessage }) =>
      setChats(cs => cs.map(c =>
        c.id === chatId
          ? { ...c, status, Messages: lastMessage ? [lastMessage] : c.Messages }
          : c
      ))
    );

    return () => { offNew(); offMsg(); offClosed(); offUpd(); };
  }, []);

  const newChats        = chats.filter(c => c.status === 'register');
  const inProgressChats = chats.filter(c => c.status === 'process');
  const closedChats     = chats.filter(c => c.status === 'closed');

  const renderChatItem = chat => {
    const preview = chat.Messages?.[0]?.content?.slice(0, 30) + '…';
    return (
      <Link
        to={`/operator/chats/${chat.id}`}
        key={chat.id}
        className={`${styles.chatItem} ${styles[chat.status]}`}
      >
        <div className={styles.chatHeader}>
          <span className={styles.chatTitle}>User #{chat.userId}</span>
          <span className={styles.chatStatus}>
            {chat.status === 'register'
              ? 'New'
              : chat.status === 'process'
              ? 'In Progress'
              : 'Closed'}
          </span>
        </div>
        <div className={styles.chatPreview}>
          {preview || '— нет сообщений —'}
        </div>
      </Link>
    );
  };

  return (
    <div className={styles.container}>
      <h2>Заявки</h2>

      {newChats.length > 0 && (
        <>
          <h3>New</h3>
          {newChats.map(renderChatItem)}
        </>
      )}

      {inProgressChats.length > 0 && (
        <>
          <h3>In Progress</h3>
          {inProgressChats.map(renderChatItem)}
        </>
      )}

      {closedChats.length > 0 && (
        <>
          <h3>Closed</h3>
          {closedChats.map(renderChatItem)}
        </>
      )}

      {chats.length === 0 && <p className={styles.noChats}>Пока нет заявок.</p>}
    </div>
  );
}
