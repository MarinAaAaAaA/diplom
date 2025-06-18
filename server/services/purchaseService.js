import SSLCertificate from '../models/sslCertificate.js';
import ProductVariant from '../models/productVariant.js';

class PurchaseService {
  async getByUser(userId) {
    const certs = await SSLCertificate.findAll({
      where: { userId },
      include: [ProductVariant],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    return certs.map(cert => ({
      id: cert.id,
      domain: cert.domain,
      variantName: cert.ProductVariant?.name,
      validTo: cert.validTo,
      downloadUrl: cert.downloadUrl
    }));
  }
}

export default new PurchaseService();