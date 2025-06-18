import React from 'react';
import styles from './NotFound.module.css';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (

    <div className={styles.container}>
        <div className={styles.head}>
            <div className={styles.meta}></div>
            <div className={styles.meta}></div>
            <div className={styles.body}></div>
        </div>
        <div className={styles.buttonContainer}>
        <Link to="/">
          <button className={styles.backButton}>Back</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
