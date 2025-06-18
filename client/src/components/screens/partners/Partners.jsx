import styles from './Partners.module.css';
import gearShield from '../../../assets/images/gear-shield.svg';

const Partners = () => (
  <section className={styles.company}>
    <div className={styles.content}>
      <h2 className={styles.title}>Партнеры</h2>
      <p className={styles.text}>
        С целью обеспечения информационной безопасности организации на основе российских технологий по передаче информации в веб-пространстве, <br/>
        предлагаем Вам предоставить нам список доменов и поддоменов для их защиты, и виды необходимых сертификатов TLS (OV, EV, Wildcard).
      </p>
      <p className={styles.text}>
        <br/>
        Мы готовы оказать помощь в короткие сроки выпустить сертификации TLS на ваши домены и поддомены,
        провести консультации в отношении средств <br/> защиты информации, используемых Вашей компанией или организацией.
      </p>
    </div>
    <div className={styles.imageWrap}>
      <img src={gearShield} alt="Безопасность" className={styles.image} />
    </div>
  </section>
);

export default Partners;