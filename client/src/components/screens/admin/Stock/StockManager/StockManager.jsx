import React, { useEffect, useState } from 'react';
import AdminService from '../../../../../services/AdminService';
import ProductService from '../../../../../services/ProductService';
import ProductVariantService from '../../../../../services/productVariantService';
import { toast } from 'react-hot-toast';

import styles from './StockManager.module.css';

export default function StockManager() {
  const [stats, setStats] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [files, setFiles] = useState({ cert: null, key: null, ca: null });
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const prodRes = await ProductService.fetchProducts();
        const products = prodRes.data;

        const nested = await Promise.all(
          products.map(p =>
            ProductVariantService.fetchVariantsByProduct(p.id)
              .then(r => r.data.map(v => ({
                id: v.id,
                name: v.name,
                productName: p.name,
              })))
          )
        );
        setVariants(nested.flat());
      } catch (e) {
        console.error(e);
        setError('Не удалось загрузить список подтоваров');
      }
    })();

    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const { data } = await AdminService.getStockStats();
      setStats(
        Object.entries(data).map(([variantId, count]) => ({ variantId, count }))
      );
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить статистику склада');
    }
  }

  function handleFileChange(e, field) {
    setFiles(f => ({ ...f, [field]: e.target.files[0] }));
  }

  async function handleUpload(e) {
    e.preventDefault();

    if (!selectedVariant) {
      toast.error('Пожалуйста, выберите подтовар');
      return;
    }
    if (!files.cert || !files.key || !files.ca) {
      toast.error('Загрузите все три файла: crt, key и ca');
      return;
    }

    const fd = new FormData();
    fd.append('cert', files.cert);
    fd.append('key', files.key);
    fd.append('ca', files.ca);

    try {
      setUploading(true);
      await AdminService.uploadStock(selectedVariant, fd);
      toast.success('Файлы успешно загружены на склад');

      setSelectedVariant('');
      setFiles({ cert: null, key: null, ca: null });
      fetchStats();
      setUploading(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Ошибка при загрузке на склад');
      setUploading(false);
    }
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Управление складом сертификатов</h2>

      <form onSubmit={handleUpload} className={styles.formCard}>
        <div className={styles.formGroup}>
          <label>Товар</label>

          <div className={styles.selectWrapper}>
            <select
              value={selectedVariant}
              onChange={e => setSelectedVariant(e.target.value)}
              required
              className={styles.select}
            >
              <option value="" disabled>
                — выберите подтовар —
              </option>
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} (товар: {v.productName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Сертификат (.crt)</label>
          <div className={styles.fileInputWrapper}>
            <label className={styles.fileLabel}>
              выберите файл
              <input
                type="file"
                accept=".crt"
                onChange={e => handleFileChange(e, 'cert')}
                className={styles.hiddenFileInput}
              />
            </label>
            <span className={styles.fileName}>
              {files.cert ? files.cert.name : 'файл не выбран'}
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Сертификат (.key)</label>
          <div className={styles.fileInputWrapper}>
            <label className={styles.fileLabel}>
              выберите файл
              <input
                type="file"
                accept=".key"
                onChange={e => handleFileChange(e, 'key')}
                className={styles.hiddenFileInput}
              />
            </label>
            <span className={styles.fileName}>
              {files.key ? files.key.name : 'файл не выбран'}
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Сертификат (.ca)</label>
          <div className={styles.fileInputWrapper}>
            <label className={styles.fileLabel}>
              выберите файл
              <input
                type="file"
                accept=".ca,.crt"
                onChange={e => handleFileChange(e, 'ca')}
                className={styles.hiddenFileInput}
              />
            </label>
            <span className={styles.fileName}>
              {files.ca ? files.ca.name : 'файл не выбран'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={uploading}
        >
          {uploading ? 'Загрузка...' : 'загрузить на склад'}
        </button>
      </form>

      <h3 className={styles.subheading}>Статистика свободных сертификатов</h3>

      {stats.length === 0 ? (
        <p>Пока нет данных по свободным сертификатам.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Variant&nbsp;ID</th>
              <th>Свободно</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(item => (
              <tr key={item.variantId}>
                <td>{item.variantId}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
