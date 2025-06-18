import $api from '../http';

export default class ProductVariantService {
  static async createVariant(productId, name, description, price, image = '') {
    return $api.post(
      `/products/${productId}/variants`,
      { name, description, price, image }
    );
  }

  static async fetchVariantsByProduct(productId) {
    return $api.get(`/products/${productId}/variants`);
  }

  static async getVariant(variantId) {
    return $api.get(`/variants/${variantId}`);
  }

}