import React, { useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';

import styles from './Layout.module.css';
import logo from './../../assets/images/logo.png';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const { store } = useContext(Context);
  const location = useLocation();
  const isProfile = location.pathname === '/profile';

  const isCurrent = (path) => location.pathname.startsWith(path);

  return (
    <div className={`${styles.layoutWrapper}${isProfile ? ` ${styles.profileWrapper}` : ''}`}>
      <Toaster position="bottom-right" containerStyle={{ bottom: 60, right: 10 }} />
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.leftPart}>
            <NavLink to="/" className={styles.logoLink}>
              <img src={logo} alt="Логотип" />
            </NavLink>
            <nav className={styles.nav}>
              <ul className={styles.navList}>
                <li>
                  <NavLink
                    to="/products"
                    className={`${styles.navLink} ${isCurrent('/products') ? styles.navLinkActive : ''}`}
                  >
                    каталог
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className={`${styles.navLink} ${isCurrent('/about') ? styles.navLinkActive : ''}`}
                  >
                    о компании
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/partners"
                    className={`${styles.navLink} ${isCurrent('/partners') ? styles.navLinkActive : ''}`}
                  >
                    партнерам
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          {store.isAuth ? (
            <NavLink to="/profile" className={styles.loginBtn}>профиль</NavLink>
          ) : (
            <NavLink to="/auth/login" className={styles.loginBtn}>войти</NavLink>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Борей Технологии. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default observer(Layout);
