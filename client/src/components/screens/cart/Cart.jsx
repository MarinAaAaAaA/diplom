import React, { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../index';

import CartService from '../../../services/CartService';
import PaymentService from '../../../services/PaymentService';

import { toast } from 'react-hot-toast';
import styles from './Cart.module.css';

const Cart = observer(() => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [domains, setDomains] = useState({});
  const [paying, setPaying] = useState(false);

  const dlg = useRef(null);

  useEffect(() => {
    if (store.isLoading) return;
    if (!store.isAuth) { navigate('/auth/login'); }
    else { load(); }
  }, [store.isAuth, store.isLoading, navigate]);

  const load = async () => {
    const { data } = await CartService.getCart(); setItems(data);
  };

  const inc = async (id, q) => { await CartService.updateQuantity(id, q + 1); load(); };
  const dec = async (id, q) => { await CartService.updateQuantity(id, q - 1); load(); };
  const rm = async id => {
    try { await CartService.removeFromCart(id); load(); toast('Удалено', { icon: '🗑️' }); }
    catch (e) { toast.error('Ошибка удаления'); }
  };

  const open = () => dlg.current?.showModal();
  const close = () => dlg.current?.close();

  const onDomChange = (id, v) => setDomains(p => ({ ...p, [id]: v.trim() }));

  const pay = async e => {
    e.preventDefault();
    setPaying(true);
    try {
      const { data } = await PaymentService.createPayment(domains);
      window.location.href = data.payment_url;
    } catch (err) {
      console.error(err);
      toast.error('Ошибка создания платежа');
      setPaying(false);
    }
  };

  const total = items.reduce((s, i) => s + (i.ProductVariant?.price ?? 0) * i.quantity, 0);

  return (
    <div className={styles.cartPage}>
      <h2>Моя корзина</h2>

      {items.length === 0
        ? <p>Ваша корзина пуста.</p>
        : <>
          <ul className={styles.cartList}>
            {items.map(it => (
              <li key={it.id} className={styles.cartItem}>
                <div><strong>{it.ProductVariant?.name}</strong></div>
                <div>{it.ProductVariant?.price} ₽</div>

                <div className={styles.quantityControls}>
                  <button onClick={() => dec(it.variantId, it.quantity)}>–</button>
                  <span className={styles.quantity}>{it.quantity}</span>
                  <button onClick={() => inc(it.variantId, it.quantity)}>+</button>
                </div>

                <button onClick={() => rm(it.variantId)}>Удалить</button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 20 }}>
            <h3>Итого: {total.toFixed(2)} ₽</h3>
            <button onClick={open} className={styles.checkoutButton}>Оплатить</button>
          </div>
        </>}

      <dialog ref={dlg} className={styles.dialog}>
        <form onSubmit={pay}>
          <h3>Введите домены</h3>
          {items.map(it => (
            <div key={it.variantId} className={styles.domainRow}>
              <label>
                {it.ProductVariant?.name}:
                <input required placeholder="example.com"
                  value={domains[it.variantId] ?? ''}
                  onChange={e => onDomChange(it.variantId, e.target.value)} />
              </label>
            </div>
          ))}

          <div className={styles.dialogButtons}>
            <button type="button" onClick={close} disabled={paying}>Отмена</button>
            <button type="submit" disabled={paying}>
              {paying ? 'Создание…' : 'Перейти к оплате'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
});

export default Cart;
