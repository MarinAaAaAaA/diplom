import React, { useState, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';

import ChangePassword from './changePassword/ChangePassword';
import IntegrationTab from './IntegrationTab/IntegrationTab';
import SupportPage from '../support/SupportPage/SupportPage';
import Cart from '../cart/Cart';

import AdminPage from '../admin/AdminPage/AdminPage';
import CreateProduct from '../admin/createProduct/CreateProduct';
import CreateVariant from '../admin/createVariant/CreateVariant';
import AdminPaymentHistory from '../admin/AdminPaymentHistory/AdminPaymentHistory';
import StockManager from '../admin/Stock/StockManager/StockManager';

import ChatApiService from '../../../services/ChatApiService';
import ChatService from '../../../services/ChatService';

import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!store.isAuth) {
      navigate('/', { replace: true });
    }
  }, [store.isAuth, navigate]);

  useEffect(() => {
    document.body.classList.add(styles.profilePageBody);
    return () => document.body.classList.remove(styles.profilePageBody);
  }, []);

  const [activeTab, setActiveTab] = useState('info');

  const [chats, setChats] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  const [adminView, setAdminView] = useState('overview');
  const [variantProductId, setVariantProductId] = useState(null);
  const mergeMsg = (list, msg) => {
    const idx = list.findIndex(
      m =>
        String(m.id).startsWith('tmp-') &&
        m.sender === msg.sender &&
        m.content === msg.content
    );
    if (idx !== -1) {
      const copy = [...list];
      copy[idx] = msg;
      return copy;
    }
    return list.some(m => m.id === msg.id) ? list : [...list, msg];
  };

  useEffect(() => {
    if (activeTab !== 'requests') return;

    ChatApiService.listOperatorChats()
      .then(({ data }) => setChats(data))
      .catch(console.error);

    ChatService.joinOperators();

    const offNew = ChatService.onNewChat(chat =>
      setChats(cs => [chat, ...cs.filter(c => c.id !== chat.id)])
    );

    const offMsg = ChatService.onMessage(msg =>
      setChats(cs =>
        cs.map(c =>
          c.id === msg.chatId
            ? {
              ...c,
              status: msg.sender === 'operator' ? 'process' : c.status,
              Messages: [msg]
            }
            : c
        )
      )
    );

    const offUpd = ChatService.onChatUpdated(({ chatId, status, lastMessage }) =>
      setChats(cs =>
        cs.map(c =>
          c.id === chatId
            ? {
              ...c,
              status,
              Messages: lastMessage ? [lastMessage] : c.Messages
            }
            : c
        )
      )
    );

    const offClose = ChatService.onChatClosed(({ chatId }) => {
      setChats(cs => cs.map(c =>
        c.id === chatId ? { ...c, status: 'closed' } : c
      ));
      if (chatId === currentId) setCurrentId(null);
    });

    return () => { offNew(); offMsg(); offUpd(); offClose(); };
  }, [activeTab, currentId]);

  useEffect(() => {
    if (!currentId) return;

    ChatService.joinChat(currentId);

    ChatApiService.fetchOperatorChat(currentId)
      .then(({ data }) => {
        setMessages(data.messages);
        setPurchases(data.purchases);
      })
      .catch(console.error);

    const offDetailMsg = ChatService.onMessage(msg => {
      if (msg.chatId === currentId) {
        setMessages(ms => mergeMsg(ms, msg));
      }
    });

    const offDetailClose = ChatService.onChatClosed(({ chatId }) => {
      if (chatId === currentId) setCurrentId(null);
    });

    return () => { offDetailMsg(); offDetailClose(); };
  }, [currentId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const send = e => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !currentId) return;

    setMessages(ms => [
      ...ms,
      { id: `tmp-${Date.now()}`, chatId: currentId, sender: 'operator', content: text },
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
    process: chats.filter(c => c.status === 'process'),
    closed: chats.filter(c => c.status === 'closed'),
  };

  const renderChatItem = c => {
    const preview = c.Messages?.[0]?.content.slice(0, 25) || '— нет сообщений —';
    const isActive = c.id === currentId;
    return (
      <button
        key={c.id}
        onClick={() => setCurrentId(c.id)}
        className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ''}`}
      >
        <div className={styles.chatTitle}>User #{c.userId}</div>
        <div className={styles.chatPreview}>{preview}</div>
      </button>
    );
  };

  return (
    <div className={styles.profileContainer}>
      <aside className={styles.sidebar}>
        <button
          onClick={() => setActiveTab('info')}
          className={activeTab === 'info' ? styles.active : ''}
        >Информация</button>

        <button
          onClick={() => setActiveTab('cart')}
          className={activeTab === 'cart' ? styles.active : ''}
        >Корзина</button>

        <button
          onClick={() => setActiveTab('integration')}
          className={activeTab === 'integration' ? styles.active : ''}
        >Интеграция</button>

        <button
          onClick={() => setActiveTab('support')}
          className={activeTab === 'support' ? styles.active : ''}
        >Поддержка</button>

        {store.isAuth && ['operator', 'admin'].includes(store.user.role) && (
          <button
            onClick={() => setActiveTab('requests')}
            className={activeTab === 'requests' ? styles.active : ''}
          >Заявки</button>
        )}

        {activeTab === 'requests' && (
          <>
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
          </>
        )}

        {store.isAuth && store.user.role === 'admin' && (
          <button
            onClick={() => { setActiveTab('admin'); setAdminView('overview'); }}
            className={activeTab === 'admin' ? styles.active : ''}
          >Админка</button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={activeTab === 'settings' ? styles.active : ''}
        >Настройки</button>
      </aside>

      <main className={styles.content}>
        {activeTab === 'info' && (
          <div className={styles.infoSection}>
            <h2>Добро пожаловать, {store.user.email}</h2>
            <p>Здесь отображается информация о вашем профиле и статистика.</p>
          </div>
        )}

        {activeTab === 'cart' && <Cart />}

        {activeTab === 'integration' && <IntegrationTab />}

        {activeTab === 'support' && <SupportPage />}

        {activeTab === 'requests' && (
          <div className={styles.chatArea}>
            {currentId ? (
              <>
                <header className={styles.chatHeader}>
                  Чат #{currentId}
                  <button onClick={finishChat} className={styles.finishBtn}>Завершить</button>
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
                  {purchases.length === 0
                    ? <p className={styles.empty}>Нет покупок.</p>
                    : purchases.map(p => (
                      <div key={p.id} className={styles.purchaseItem}>
                        <span>
                          {p.domain} до {new Date(p.validTo).toLocaleDateString()}
                        </span>
                        <a
                          href={`${import.meta.env.VITE_BASE_URL}${p.downloadUrl}`}
                          download
                        >Скачать ZIP</a>
                      </div>
                    ))
                  }
                </section>
              </>
            ) : (
              <p className={styles.emptyCenter}>Выберите заявку слева</p>
            )}
          </div>
        )}
        {activeTab === 'admin' && (
          <div className={styles.adminArea}>
            {adminView === 'overview' && (
              <AdminPage
                onCreate={() => setAdminView('create')}
                onVariant={id => {
                  setVariantProductId(id);
                  setAdminView('variant');
                }}
                onHistory={() => setAdminView('history')}
                onStock={() => setAdminView('stock')}
              />
            )}

            {adminView === 'create' && (
              <>
                <button
                  onClick={() => setAdminView('overview')}
                  className={styles.backBtn}
                >←</button>
                <CreateProduct />
              </>
            )}

            {adminView === 'variant' && (
              <>
                <button
                  onClick={() => setAdminView('overview')}
                  className={styles.backBtn}
                >←</button>
                <CreateVariant productId={variantProductId} />
              </>
            )}

            {adminView === 'history' && (
              <>
                <button
                  onClick={() => setAdminView('overview')}
                  className={styles.backBtn}
                >←</button>
                <AdminPaymentHistory />
              </>
            )}

            {adminView === 'stock' && (
              <>
                <button
                  onClick={() => setAdminView('overview')}
                  className={styles.backBtn}
                >←</button>
                <StockManager />
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && <ChangePassword />}
      </main>
    </div>
  );
};

export default observer(Profile);
