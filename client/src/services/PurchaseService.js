import $api from '../http';

export default class PurchaseService {
  static getAll() {
    return $api.get('/admin/purchases');
  }
}