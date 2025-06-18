import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import ProductService from '../../../../services/ProductService';
import ProductVariantService from '../../../../services/productVariantService';
import CartService from '../../../../services/CartService';
import { Context } from '../../../../index';
import { toast } from 'react-hot-toast';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, [productId]);

  async function fetchProduct() {
    try {
      const response = await ProductService.getProduct(productId);
      setProduct(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchVariants() {
    try {
      const response = await ProductVariantService.fetchVariantsByProduct(productId);
      setVariants(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddToCart(variantId) {
    if (!store.isAuth) {
      navigate('/auth/login');
      return;
    }
    try {
      await CartService.addToCart(variantId, 1);
      toast.success('Товар добавлен в корзину');
    } catch (error) {
      toast.error('Не удалось добавить товар');
    }
  }

  return (
    <div className={styles.detailsContainer}>
      {product && (
        <>
          <h2>{product.name}</h2>
          {product.image && (
            <img
              src={`${import.meta.env.VITE_BASE_URL}${product.image}`}
              alt={product.name}
              className={styles.productImage}
            />
          )}
          <p>{product.description}</p>

          <h3>Подтовары:</h3>
          <div className={styles.variantsList}>
            {variants.length > 0 ? variants.map(variant => (
              <div key={variant.id} className={styles.variantItem}>
                {variant.image && (
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}${variant.image}`}
                    alt={variant.name}
                    className={styles.variantImage}
                  />
                )}
                <h4>{variant.name}</h4>
                <p>{variant.description}</p>
                <p><strong>Цена: {variant.price} руб.</strong></p>
                <button onClick={() => handleAddToCart(variant.id)}>
                  Добавить в корзину
                </button>
              </div>
            )) : <p>Нет подтоваров.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetails;
