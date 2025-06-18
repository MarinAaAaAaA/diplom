import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminService from '../../../../../services/AdminService';
import styles from './StockUpload.module.css';
import toast from 'react-hot-toast';

export default function StockUpload() {
  const { variantId } = useParams();
  const [file, setFile] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return toast('Выберите файл', {
      icon: '⚠️',
    });

    const fd = new FormData();
    fd.append('zip', file);
    await AdminService.uploadToStock(variantId, fd);
    toast.success('Загружено на склад');
    setFile(null);
  };

  return (
    <div className={styles.wrap}>
      <h2>Добавить сертификат в склад (variantId={variantId})</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit">Загрузить</button>
      </form>
    </div>
  );
}
