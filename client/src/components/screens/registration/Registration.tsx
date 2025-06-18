import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import styles from './Registration.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Registration = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [inn, setInn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [innError, setInnError] = useState('');

    useEffect(() => {
      if (store.isAuth) {
        navigate('/', { replace: true });
      }
    }, [store.isAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInnError('');

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают!');
      return;
    }

    try {
      await store.registration(email, inn, password, confirmPassword);
      toast.success('Сообщение с подтверждением отправлено вам на почту');
      navigate('/'); 
    } catch (err: any) {
      const msg = err.message || 'Ошибка регистрации';
      if (msg.toLowerCase().includes('инн')) {
        setInnError(msg);
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className={styles.registrationPage}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Регистрация</h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="regEmail" className={styles.label}>E-mail</label>
            <input
              id="regEmail"
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="regInn" className={styles.label}>ИНН</label>
            <input
              id="regInn"
              type="text"
              placeholder="Введите ИНН"
              value={inn}
              onChange={e => {
                setInn(e.target.value);
                if (innError) setInnError('');
              }}
              className={styles.input}
              required
            />
            {innError && (
              <span className={styles.errorText}>{innError}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="regPassword" className={styles.label}>Пароль</label>
            <input
              id="regPassword"
              type="password"
              placeholder="Придумайте пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              minLength={5}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="regConfirm" className={styles.label}>
              Подтверждение пароля
            </label>
            <input
              id="regConfirm"
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={styles.input}
              minLength={5}
              required
            />
          </div>

          <button type="submit" className={styles.btn}>
            Зарегистрироваться
          </button>

          <div className={styles.formFooter}>
            <p>
              Уже есть аккаунт?{' '}
              <Link to="/auth/login" className={styles.link}>
                Войти
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default observer(Registration);
