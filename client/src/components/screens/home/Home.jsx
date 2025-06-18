import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import FAQ from './FAQ/Faq';
import CertCatalog from './CertCatalog/CertCatalog';

const Home = () => {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.visuallyHidden}>Главная страница</h1>
        <div className={styles.columns}>
          <div className={styles.leftColumn}>
            <p className={styles.text}>
              Добро пожаловать в наш магазин SSL-сертификатов!
              <br /><br />
              Здесь вы можете выбрать подходящий сертификат для защиты своего сайта.
              Мы предлагаем различные варианты – от базовых до сертификатов с расширенной проверкой.
              Авторизуйтесь, чтобы получить доступ к корзине и оформить покупку.
            </p>
          </div>
          <div className={styles.rightColumn}>
            <Link to="/products" className={styles.btn}>
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>
      <CertCatalog />
      <section className={styles.faq}>
        <FAQ></FAQ>
      </section>
    </div>
  );
};

export default Home;
