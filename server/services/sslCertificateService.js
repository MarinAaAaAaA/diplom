import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import archiver from 'archiver';
import { addMonths, differenceInDays } from 'date-fns';

import SSLCertificate  from '../models/sslCertificate.js';
import ProductVariant  from '../models/productVariant.js';
import ApiError        from '../exceptions/apiError.js';

function isPastThreshold(cert) {
  const totalDays = differenceInDays(cert.validTo, cert.validFrom);
  const usedDays  = differenceInDays(new Date(), cert.validFrom);
  return totalDays > 0 && (usedDays / totalDays) >= 0.9;
}

class SSLCertificateService {
  getAll(opts = {}) {
    return SSLCertificate.findAll({ ...opts, include: [ProductVariant] });
  }

  getById(id) {
    return SSLCertificate.findByPk(id, { include: [ProductVariant] });
  }

  getByUser(userId) {
    return SSLCertificate.findAll({ where: { userId }, include: [ProductVariant] });
  }

  async markThreshold() {
    const issued = await SSLCertificate.findAll({ where: { status: 'issued' } });
    await Promise.all(issued.map(async cert => {
      if (!cert.renewalThresholdReached && isPastThreshold(cert)) {
        cert.renewalThresholdReached = true;
        await cert.save();
      }
    }));
  }

  async revokeExpired() {
    const now = new Date();
    const expired = await SSLCertificate.findAll({
      where: {
        status: 'issued',
        validTo: { [Op.lt]: now }
      }
    });
    await Promise.all(expired.map(cert => {
      cert.status    = 'expired';
      cert.revokedAt = now;
      return cert.save();
    }));
  }

  async renew(certId, additionalMonths = 12) {
    const cert = await SSLCertificate.findByPk(certId);
    if (!cert) throw ApiError.NotFound('Сертификат не найден');
    if (cert.status !== 'issued') throw ApiError.BadRequest('Нельзя продлить этот сертификат');
    cert.validTo = addMonths(cert.validTo, additionalMonths);
    cert.renewalThresholdReached = false;
    await cert.save();
    return cert;
  }

  async attachFiles(certId, files) {
    const cert = await SSLCertificate.findByPk(certId);
    if (!cert) throw ApiError.NotFound('Сертификат не найден');

    if (files.cert) cert.certificatePem = fs.readFileSync(files.cert.tempFilePath, 'utf8');
    if (files.key ) cert.privateKeyPem  = fs.readFileSync(files.key.tempFilePath,  'utf8');
    if (files.ca  ) cert.caBundlePem    = fs.readFileSync(files.ca.tempFilePath,   'utf8');

    if (files.zip) {
      const fileName  = Date.now() + '_' + files.zip.name;
      const uploadRel = path.join('uploads','issued',fileName);
      const uploadAbs = path.resolve(uploadRel);
      await files.zip.mv(uploadAbs);
      cert.downloadUrl = `/${uploadRel.replace(/\\/g,'/')}`;
    }

    cert.status = 'issued';
    await cert.save();
    return cert;
  }

  async bundleAndIssue(certId, { certificatePem, privateKeyPem, caBundlePem }) {
    const cert = await SSLCertificate.findByPk(certId);
    if (!cert) throw ApiError.NotFound('Сертификат не найден');

    const safeDomain = cert.domain.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const zipName = `${Date.now()}_${safeDomain}.zip`;
    const relPath = path.join('uploads','issued', zipName);
    const absPath = path.resolve(relPath);
    await fs.promises.mkdir(path.dirname(absPath), { recursive: true });

    const output = fs.createWriteStream(absPath);
    const archive = archiver('zip');
    archive.pipe(output);
    archive.append(certificatePem, { name: `${safeDomain}.crt` });
    archive.append(privateKeyPem,  { name: `${safeDomain}.key` });
    archive.append(caBundlePem,    { name: `ca-bundle.crt` });
    await archive.finalize();

    cert.downloadUrl = '/' + relPath.replace(/\\/g,'/');
    cert.status      = 'issued';
    await cert.save();

    return cert;
  }

}

export default new SSLCertificateService();