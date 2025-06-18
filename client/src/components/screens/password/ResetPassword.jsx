import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import UserService from '../../../services/UserService';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await UserService.resetPassword(token, newPassword, confirmPassword);
      alert(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <h2>Сброс пароля</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          placeholder="Введите новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Подтвердите новый пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Сохранить новый пароль</button>
      </form>
    </div>
  );
};

export default ResetPassword;
