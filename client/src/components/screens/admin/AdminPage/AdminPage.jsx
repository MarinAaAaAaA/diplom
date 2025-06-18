import React, { useState, useEffect } from 'react';
import ProductService from '../../../../services/ProductService';
import styles from './AdminPage.module.css';

export default function AdminPage({ onCreate, onHistory, onStock, onVariant }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    ProductService.fetchProducts()
      .then(r => setProducts(r.data))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Панель администратора</h2>
      <div className={styles.buttonsWrapper}>
        <button onClick={onCreate}  className={styles.createButton}>
          + Создать товар
        </button>
        <button onClick={onHistory} className={styles.historyButton}>
          История покупок
        </button>
        <button onClick={onStock}   className={styles.historyButton}>
          Склад сертификатов
        </button>
      </div>

      <h3 className={styles.subheading}>Список товаров:</h3>
      <div className={styles.productList}>
        {products.length === 0 && <p>Нет доступных товаров.</p>}
        {products.map(product => (
          <div key={product.id} className={styles.productCard}>
            {product.image && (
              <img
                src={`${import.meta.env.VITE_BASE_URL}${product.image}`}
                alt={product.name}
                className={styles.productImage}
              />
            )}
            <div className={styles.productInfo}>
              <h4>{product.name}</h4>
              <p>{product.description}</p>
              <button
                onClick={() => onVariant(product.id)}
                className={styles.variantButton}
              >
                Создать подтовар
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}