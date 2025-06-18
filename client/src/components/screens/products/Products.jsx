import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ProductService from '../../../services/ProductService';
import ProductVariantService from '../../../services/productVariantService';
import CartService from '../../../services/CartService';
import { Context } from '../../../index';

import styles from './Products.module.css';

const Products = observer(() => {
  const [categories, setCategories] = useState([]);
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: prods } = await ProductService.fetchProducts();
        const withVariants = await Promise.all(
          prods.map(async prod => {
            const { data: variants } =
              await ProductVariantService.fetchVariantsByProduct(prod.id);
            return { ...prod, variants };
          })
        );
        setCategories(withVariants);
      } catch (e) {
        console.error('Ошибка при загрузке каталога:', e);
      }
    })();
  }, []);

  const handleAddToCart = async variantId => {
    if (!store.isAuth) {
      navigate('/auth/login');
      return;
    }
    try {
      await CartService.addToCart(variantId, 1);
      toast.success('Добавлено в корзину');
    } catch (e) {
      console.error(e);
      toast.error('Не удалось добавить в корзину');
    }
  };

  return (
    <div className={styles.catalog}>
      <h2 className={styles.h2}>Каталог сертификатов</h2>

      {categories.map(cat => (
        <div key={cat.id} className={styles.categorySection}>
          <div className={styles.categoryLabel}>
            {cat.name}
          </div>
          <div className={styles.cards}>
            {cat.variants.map(v => (
              <div key={v.id} className={styles.card}>
                <div className={styles.cardTitle}>{v.name}</div>
                <div className={styles.cardPrice}>
                  {v.price.toLocaleString('ru-RU')}₽
                  <span className={styles.priceSuffix}>/год</span>
                </div>
                {v.description && (
                  <div className={styles.cardDesc}>{v.description}</div>
                )}
                <button
                  className={styles.cardButton}
                  onClick={() => handleAddToCart(v.id)}
                >
                  купить
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default Products;