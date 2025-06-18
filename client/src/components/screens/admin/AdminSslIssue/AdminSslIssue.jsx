import React, { useEffect, useState } from 'react';
import AdminService from '../../../../services/AdminService';
import styles from './AdminSslIssue.module.css';

export default function AdminSslIssue() {
  const [list, setList] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await AdminService.getPendingCerts();
    setList(data);
  };

  const upload = async (id, e) => {
    const fd = new FormData();
    fd.append('zip', e.target.files[0]);
    await AdminService.uploadCertificate(id, fd);
    load();
  };

  return (
    <div className={styles.wrap}>
      <h2>Выдача SSL-сертификатов</h2>

      {list.length === 0
        ? <p>Нет ожидающих сертификатов.</p>
        : (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>User</th><th>Domain</th><th>Файл .zip</th></tr></thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.userId}</td>
                  <td>{c.domain}</td>
                  <td><input type="file" onChange={e => upload(c.id, e)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}
