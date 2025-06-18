import React, { useState } from 'react';
import styles from './FAQ.module.css';
import plus from './../../../../assets/images/plus.svg'
import minus from './../../../../assets/images/minus.svg'

const faqData = [
  {
    question: 'Как проходит процесс проверки?',
    answer:
      'Процесс проверки организации включает пять этапов: 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) .. 1) Аутентификация организации; 2) ..',
  },
  {
    question: 'Как SSL-сертификат влияет на позиции сайта в поиске?',
    answer:
      'Наличие SSL-сертификата повышает доверие поисковиков и может позитивно влиять на ранжирование.',
  },
  {
    question: 'Кому подойдёт OV TLS?',
    answer:
      'OV-сертификаты оптимальны для компаний, которым важно показать юридический статус и владение доменом.',
  },
  {
    question: 'Что даёт подтверждение организации в SSL-сертификатах?',
    answer:
      'В браузере отображается название вашей организации, что повышает доверие пользователей.',
  },
];

const FAQItem = ({ id, isOpen, onToggle, question, answer }) => (
  <div className={styles.item}>
    <button
      className={styles.questionRow}
      aria-expanded={isOpen}
      aria-controls={`faq-${id}`}
      onClick={onToggle}
    >
      <span className={styles.question}>{question}</span>
      <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>
        {isOpen ? <img src={minus} alt="Закрыть" className={styles.iconImg} /> : <img src={plus} alt="Открыть" className={styles.iconImg} />}
      </span>
    </button>

    {isOpen && (
      <div id={`faq-${id}`} className={styles.answer}>
        {answer}
      </div>
    )}
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className={styles.faqSection} id="faq">
      <h2 className={styles.title}>Часто задаваемые вопросы</h2>

      <div className={styles.grid}>
        {faqData.map((item, idx) => (
          <FAQItem
            key={idx}
            id={idx}
            isOpen={openIndex === idx}
            onToggle={() =>
              setOpenIndex(openIndex === idx ? null : idx)
            }
            {...item}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
