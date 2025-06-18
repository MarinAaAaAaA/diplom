import React, { useState } from 'react';
import UserService from '../../../services/UserService';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await UserService.forgotPassword(email);
      alert(response.data.message);
      setEmail('');
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <h2>Забыли пароль?</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Введите ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Отправить ссылку</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
