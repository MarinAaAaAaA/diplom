import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Context } from '../../../../index';
import PurchaseService from '../../../../services/PurchaseService';
import styles from './PurchasesPage.module.css';

export default function PurchasesPage() {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!store.isAuth || store.user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPurchases();
  }, [store, navigate]);

  async function fetchPurchases() {
    try {
      const { data } = await PurchaseService.getAll();
      setList(data);
    } catch (e) {
      console.error('Ошибка загрузки покупок:', e);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2>История покупок сертификатов</h2>
      {list.length === 0 ? (
        <p>Покупок ещё нет.</p>
      ) : (
        <div className={styles.grid}>
          {list.map(p => (
            <div key={p.id} className={styles.card}>
              <h3>{p.domain}</h3>
              <p><b>Покупатель:</b> {p.User.email} (ID {p.User.id})</p>
              <p><b>Тип:</b> {p.ProductVariant.name}</p>
              <p><b>Куплен:</b> {new Date(p.createdAt).toLocaleString()}</p>
              <p><b>Действует до:</b> {new Date(p.validTo).toLocaleDateString()}</p>
              <a
                href={`${import.meta.env.VITE_BASE_URL}${p.downloadUrl}`}
                download
                className={styles.btn}
              >
                Скачать ZIP
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
