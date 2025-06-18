import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productVariantService from '../../../../services/productVariantService';
import toast from 'react-hot-toast';
import { API_URL } from '../../../../http';
import styles from './CreateVariant.module.css';

export default function CreateVariant({ productId: propProductId }) {
  const params = useParams();
  const productId = propProductId ?? params.productId;
  const navigate = useNavigate();

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview]         = useState(null);
  const [uploading, setUploading]     = useState(false);

  const handleFileChange = e => {
    const file = e.target.files[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!productId) {
      toast.error('Не удалось определить товар');
      return;
    }

    try {
      const { data: variant } = await productVariantService.createVariant(
        productId,
        name,
        description,
        parseFloat(price),
        ''
      );
      const variantId = variant.id;

      if (selectedFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', selectedFile);
        const token = localStorage.getItem('token');

        const res = await fetch(
          `${API_URL}/products/${productId}/variants/${variantId}/upload`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${res.status}\n${text}`);
        }
        setUploading(false);
      }

      toast.success('Вариант успешно создан!');
    } catch (err) {
      console.error('Ошибка создания варианта:', err);
      toast.error(err.message || 'Не удалось создать вариант');
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        Создать вариант для товара №{productId}
      </h2>
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название</label>
          <input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price">Цена (₽)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Изображение (необязательно)</label>
          <div className={styles.fileInputWrapper}>
            <input
              id="variant-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />
            <label htmlFor="variant-image" className={styles.fileLabel}>
              {selectedFile ? 'Изменить файл' : 'Выберите файл'}
            </label>
            <span className={styles.fileName}>
              {selectedFile ? selectedFile.name : 'файл не выбран'}
            </span>
          </div>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className={styles.previewImage}
            />
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={uploading}
        >
          {uploading ? 'Загрузка…' : 'Создать вариант'}
        </button>
      </form>
    </div>
  );
}
