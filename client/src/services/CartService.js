import $api from '../http';

export default class CartService {
  static async getCart() {
    return $api.get('/cart');
  }

  static async addToCart(variantId, quantity = 1) {
    return $api.post('/cart', { variantId, quantity });
  }

  static async removeFromCart(variantId) {
    return $api.delete('/cart', {
      data: { variantId },
    });
  }

  static async updateQuantity(variantId, newQuantity) {
    return $api.patch('/cart', { variantId, newQuantity });
  }
}