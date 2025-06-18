import React, { useState } from 'react';
import $api, { API_URL } from '../../../../http';
import toast from 'react-hot-toast';
import styles from './CreateProduct.module.css';

export default function CreateProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    try {
      const { data } = await $api.post('/products', { name, description });
      const productId = data.id;

      if (selectedFile) {
        setUploading(true);
        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('image', selectedFile);

        const res = await fetch(
          `${API_URL}/products/${productId}/upload-image`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: fd
          }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${res.status}\n${text}`);
        }
        setUploading(false);
      }

      toast.success('Категория успешно создана!');
      setName('');
      setDescription('');
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Ошибка создания категории:', err);
      toast.error(err.message || 'Не удалось создать категорию');
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Создать новую категорию</h2>
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="product-name">Название</label>
          <input
            id="product-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Введите название"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="product-desc">Описание</label>
          <textarea
            id="product-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder="Краткое описание категории"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Изображение (необязательно)</label>
          <div className={styles.fileInputWrapper}>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />
            <label htmlFor="product-image" className={styles.fileLabel}>
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
          {uploading ? 'Загрузка…' : 'Создать категорию'}
        </button>
      </form>
    </div>
  );
}