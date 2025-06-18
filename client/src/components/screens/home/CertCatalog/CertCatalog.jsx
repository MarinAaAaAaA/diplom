import { Link } from 'react-router-dom';

import styles from './CertCatalog.module.css';
import arrow from '../../../../assets/images/arrow.svg';

const CERT_CARDS = [
  {
    code: 'DV',
    title: 'Подтверждение права управления доменом',
    features: ['Защита одного домена', 'Wildcard TLS'],
  },
  {
    code: 'OV',
    title: 'Подтверждение существования организации',
    features: ['Защита одного домена', 'Wildcard TLS'],
  },
  {
    code: 'EV',
    title: 'Расширенное подтверждение организации',
    features: ['Защита одного домена'],
  },
];

const CertCatalog = () => {
  return (
    <section className={styles.certCatalog}>
      <h2 className={styles.title}>Каталог сертификатов</h2>
      <div className={styles.certGrid}>
        {CERT_CARDS.map(({ code, title, features }) => (
          <Link
            key={code}
            to="/products"
            className={styles.certCard}
          >
            <span className={styles.bigLetter}>{code}</span>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{title}</h3>
              <ul className={styles.cardList}>
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <span className={styles.arrowWrap}>
              <span className={styles.arrowIcon}>
                <img src={arrow} alt="→" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CertCatalog;
