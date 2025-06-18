import { readFileSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import sequelize from '../db.js';

import StockCertificate from '../models/stockCertificate.js';
import ProductVariant from '../models/productVariant.js';

class StockService {
  async add(variantId, files) {
    const row = {
      variantId,
      certificatePem: files.cert ? readFileSync(files.cert.tempFilePath, 'utf8') : null,
      privateKeyPem: files.key ? readFileSync(files.key.tempFilePath, 'utf8') : null,
      caBundlePem: files.ca ? readFileSync(files.ca.tempFilePath, 'utf8') : null,
      downloadUrl: null,
    };

    if (files.zip) {
      const name = Date.now() + '_' + nanoid(6) + '_' + files.zip.name;
      const rel = path.join('uploads', 'stock', name);
      await files.zip.mv(path.resolve(rel));
      row.downloadUrl = '/' + rel.replace(/\\/g, '/');
    }
    return StockCertificate.create(row);
  }

  async popFree(variantId) {
    const stock = await StockCertificate.findOne({
      where: { variantId, status: 'free' },
      order: [['createdAt', 'ASC']],
    });
    if (!stock) return null;
    stock.status = 'reserved';
    await stock.save();
    return stock;
  }

  async markUsed(stockId, sslCertId) {
    await StockCertificate.update(
      { status: 'used', sslCertificateId: sslCertId },
      { where: { id: stockId } }
    );
  }

  async stats() {
    const counts = await StockCertificate.findAll({
      where: { status: 'free' },
      attributes: [
        'variantId',
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['variantId'],
      raw: true,
    });
    return counts.reduce((acc, { variantId, count }) => {
      acc[variantId] = Number(count);
      return acc;
    }, {});
  }
}

export default new StockService();