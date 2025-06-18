import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaymentSuccess.module.css';

const PaymentSuccess = () => {
  return (
    <div className={styles.successContainer}>
      <h2>Оплата успешно произведена!</h2>
      <p>Спасибо за покупку. Ваш платеж был успешно обработан.</p>
      <Link to="/profile" className={styles.profileLink}>
        Перейти в профиль
      </Link>
    </div>
  );
};

export default PaymentSuccess;
