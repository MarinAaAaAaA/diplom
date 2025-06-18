import $api from '../http';

export default class PaymentService {
  static async createPayment(domains) {
    return $api.post('/payment/create', { domains });
  }

  static async getAllPayments() {
    return $api.get('/payment/all');
  }
}