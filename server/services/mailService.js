import nodemailer from 'nodemailer';

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendActivationMail(to, link) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: 'Активация аккаунта на ' + process.env.API_URL,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f5f5f5;">
                        <h2 style="color: #333; text-align: center;">Активация аккаунта</h2>
                        <p>Здравствуйте!</p>
                        <p>Для завершения регистрации на нашем сайте, необходимо активировать аккаунт:</p>
                        <p style="text-align: center;"><a href="${link}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Активировать аккаунт</a></p>
                        <p>Ссылка действительна один раз. После активации используйте ваши учётные данные для входа.</p>
                    </div>
                `,
            });
        } catch (error) {
            console.error('Ошибка при отправке письма активации:', error);
        }
    }

    async sendResetPasswordMail(to, link) {
        try {
          await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Сброс пароля на ' + process.env.API_URL,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f5f5f5;">
                <h2 style="color: #333; text-align: center;">Сброс пароля</h2>
                <p>Здравствуйте!</p>
                <p>Чтобы сбросить пароль, перейдите по ссылке ниже:</p>
                <p style="text-align: center;"><a href="${link}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Сбросить пароль</a></p>
                <p>Ссылка действительна в течение 1 часа.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Ошибка при отправке письма сброса пароля:', error);
        }
    }

    async sendPurchaseMail(to, items, profileUrl) {
    const listHtml = items.map(
      it => `<li><strong>${it.domain}</strong>: действует до ${new Date(it.validTo).toLocaleDateString()}</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;
                  border:1px solid #ddd; border-radius:8px; background:#f5f5f5;">
        <h2 style="color:#333; text-align:center;">Спасибо за вашу покупку!</h2>
        <p>Вы приобрели следующие SSL-сертификаты:</p>
        <ul>
          ${listHtml}
        </ul>
        <p>Общая ссылка на ваш <a href="${profileUrl}">Профиль</a>, где вы всё сможете скачать и посмотреть статус сертификатов.</p>
        <p>С уважением,<br/>Команда поддержки</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Подтверждение покупки SSL-сертификатов',
      html,
    });
  }

}

export default new MailService();
