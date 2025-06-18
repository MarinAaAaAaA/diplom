import React, { useContext, useEffect, useState } from 'react';
import styles from './Login.module.css';
import { Context } from '../../../index';
import { observer } from 'mobx-react-lite';
import { Link, useNavigate } from 'react-router-dom';

const Login = observer(() => {
  const { store } = useContext(Context);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
   useEffect(() => {
    if (store.isAuth) {
      navigate('/', { replace: true });
    }
  }, [store.isAuth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    store.login(email, password);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Вход</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="loginEmail" className={styles.label}>E-mail</label>
            <input
              id="loginEmail"
              className={styles.input}
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="loginPassword" className={styles.label}>Пароль</label>
            <input
              id="loginPassword"
              className={styles.input}
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.btn}>
            Войти
          </button>

          <div className={styles.formFooter}>
            <p>
              Нет аккаунта?{' '}
              <Link to="/auth/registration" className={styles.link}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Login;
