import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import ProfileService from '../../../../services/ProfileService';
import styles from './IntegrationTab.module.css';

export default function IntegrationTab() {
  const [apiKey, setApiKey] = useState(null);
  const [certs, setCerts] = useState([]);
  const [current, setCurrent] = useState(null);

  const dlgApi = useRef(null);
  const dlgInst = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [{ data: keyData }, { data: certData }] = await Promise.all([
        ProfileService.getApiKey(),
        ProfileService.getMyCertificates(),
      ]);
      setApiKey(keyData.apiKey);
      setCerts(certData);
    } catch (e) {
      console.error('Ошибка загрузки данных профиля:', e);
      toast.error('Не удалось загрузить данные');
    }
  }

  const issue = async () => {
    try {
      const { data } = await ProfileService.issueApiKey();
      setApiKey(data.apiKey);
      toast('Сохраните ключ! Он показывается один раз.');
    } catch (e) {
      console.error(e);
      toast.error('Не удалось сгенерировать ключ');
    }
  };

  const rotate = async () => {
    try {
      const { data } = await ProfileService.rotateApiKey();
      setApiKey(data.apiKey);
      toast.success('Ключ обновлён');
    } catch (e) {
      console.error(e);
      toast.error('Не удалось сменить ключ');
    }
  };

  const handleRenew = async (certId) => {
    try {
      const { data } = await ProfileService.renewCertificate(certId);
      const until = new Date(data.cert.validTo).toLocaleDateString();
      toast.success(`Сертификат продлён до ${until}`);
      await load();
    } catch (e) {
      console.error('Ошибка продления:', e);
      toast.error(e.response?.data?.message || 'Не удалось продлить сертификат');
    }
  };

  const openInst = cert => { setCurrent(cert); dlgInst.current?.showModal(); };
  const closeInst = () => dlgInst.current?.close();
  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Интеграция API</h2>

      {apiKey ? (
        <div className={styles.keyBox}>
          <code className={styles.key}>{apiKey}</code>

          <button onClick={rotate} className={styles.btnSmall}>
            Сменить ключ
          </button>

          <button
            onClick={() => dlgApi.current.showModal()}
            className={styles.btnSmall}
          >
            Инструкция по API
          </button>
        </div>
      ) : (
        <button onClick={issue} className={styles.btn}>
          Сгенерировать ключ
        </button>
      )}

      <hr className={styles.hr} />
      <h3 className={styles.subheading}>Мои сертификаты</h3>

      {certs.length === 0 ? (
        <p>Покупок ещё нет.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Домен</th>
                <th>Тип</th>
                <th>Серийный</th>
                <th>Дата&nbsp;покупки</th>
                <th>Действует&nbsp;до</th>
                <th>ZIP</th>
                <th>Установка</th>
                <th>Продление</th>
              </tr>
            </thead>
            <tbody>
              {certs.map(c => {
                const from = new Date(c.validFrom).toLocaleDateString();
                const to = new Date(c.validTo).toLocaleDateString();
                return (
                  <tr key={c.id}>
                    <td>{c.domain}</td>
                    <td>{c.ProductVariant?.name}</td>
                    <td>{c.serial}</td>
                    <td>{from}</td>
                    <td>{to}</td>
                    <td>
                      {c.downloadUrl
                        ? (
                          <a
                            href={`${import.meta.env.VITE_BASE_URL}${c.downloadUrl}`}
                            download
                          >
                            скачать
                          </a>
                        )
                        : 'ожидает'}
                    </td>
                    <td>
                      {c.downloadUrl && (
                        <button
                          onClick={() => openInst(c)}
                          className={styles.btnSmall}
                        >
                          Инструкция
                        </button>
                      )}
                    </td>
                    <td>
                      {c.status === 'issued' && c.renewalThresholdReached ? (
                        <button
                          onClick={() => handleRenew(c.id)}
                          className={styles.btnSmall}
                        >
                          Продлить
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <dialog ref={dlgApi} className={styles.dialog}>
        <h3>Как пользоваться Integration API</h3>

        <p>Все запросы к <code>/api/integration/…</code> требуют заголовок:</p>
        <pre><code>X-API-KEY: {apiKey ?? '<ваш API-ключ>'}</code></pre>

        <h4>Пример cURL</h4>
        <pre><code>{`curl -H "X-API-KEY: ${apiKey ?? '<ваш ключ>'}" \\ ${import.meta.env.VITE_API_URL}/integration/ssl-certs`}</code></pre>

        <form method="dialog">
          <button className={styles.btnClose}>Закрыть</button>
        </form>
      </dialog>
      <dialog ref={dlgInst} className={styles.dialog}>
        {current && (
          <>
            <h3>Установка SSL для {current.domain}</h3>
            <ol>
              <li>Скачайте и распакуйте файлы <code>.crt</code>, <code>.key</code> и&nbsp;<code>ca-bundle.crt</code>.</li>
              <li>Загрузите их в&nbsp;панель хостинга или поместите в&nbsp;<code>/etc/ssl/</code>.</li>
              <li>Перезапустите веб-сервер (например, <code>systemctl restart nginx</code>).</li>
            </ol>

            <h4>Пример конфига Nginx</h4>
            <pre><code>{`server {
    listen 443 ssl;
    server_name ${current.domain};

    ssl_certificate         /etc/ssl/${current.domain}.crt;
    ssl_certificate_key     /etc/ssl/${current.domain}.key;
    ssl_trusted_certificate /etc/ssl/ca-bundle.crt;
}`}</code></pre>

            <form method="dialog">
              <button onClick={closeInst} className={styles.btnClose}>Закрыть</button>
            </form>
          </>
        )}
      </dialog>
    </div>
  );
}
