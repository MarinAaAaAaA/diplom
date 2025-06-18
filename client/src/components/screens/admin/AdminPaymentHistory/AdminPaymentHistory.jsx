import React, { useState, useEffect } from 'react';
import PaymentService from '../../../../services/PaymentService';
import styles from './AdminPaymentHistory.module.css';

const AdminPaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await PaymentService.getAllPayments();
        setPayments(response.data);
      } catch (error) {
        console.error('Ошибка загрузки платежей:', error);
      }
    }
    fetchPayments();
  }, []);

  return (
    <div className={styles.container}>
      <h2>История платежей</h2>
      {payments.length === 0 ? (
        <p>Нет платежей.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Payment ID</th>
              <th>User ID</th>
              <th>Сумма (руб.)</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.paymentId}</td>
                <td>{payment.userId}</td>
                <td>{payment.amount}</td>
                <td>{payment.status}</td>
                <td>{new Date(payment.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPaymentHistory;