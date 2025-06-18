import $api from '../http';

export default class ProductService {
  static async fetchProducts() {
    return $api.get('/products');
  }

  static async getProduct(productId) {
    return $api.get(`/products/${productId}`);
  }

  static async createProduct(name, description, image = '') {
    return $api.post('/products', { name, description, image });
  }

}