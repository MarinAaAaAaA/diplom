import $api from '../http';

export default class AdminService {
  static getStockStats()                 { return $api.get('/admin/stock-stats'); }
  static uploadStock(variantId, fd)    {
    return $api.post(`/admin/stock/${variantId}/upload`, fd, {
      headers:{ 'Content-Type':'multipart/form-data' }
    });
  }

  static getPendingCerts()               { return $api.get('/admin/ssl-pending'); }
  static uploadCertificate(certId, fd)   {
    return $api.post(`/admin/ssl/${certId}/upload`, fd, {
      headers:{ 'Content-Type':'multipart/form-data' }
    });
  }
}
