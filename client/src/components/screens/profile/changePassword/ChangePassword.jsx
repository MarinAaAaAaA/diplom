import React, { useState, useContext } from 'react';
import { Context } from '../../../../index';
import UserService from '../../../../services/UserService';
import toast from 'react-hot-toast';

import styles from './ChangePassword.module.css';

export default function ChangePassword() {
  const { store } = useContext(Context);

  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => store.logout();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Новый пароль и подтверждение не совпадают!');
      return;
    }
    try {
      setSubmitting(true);
      await UserService.changePassword(store.user.id, oldPassword, newPassword);
      toast.success('Пароль успешно изменён');
      setOld(''); setNew(''); setConfirm('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка при смене пароля');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.heading}>Смена пароля</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Старый пароль</span>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOld(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Новый пароль</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Подтвердите пароль</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting}
        >
          {submitting ? 'Сохраняем…' : 'Сменить пароль'}
        </button>
      </form>

      <button
        onClick={handleLogout}
        className={styles.logoutBtn}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
