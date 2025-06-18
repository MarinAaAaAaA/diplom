import ProductVariant from '../models/productVariant.js';
import ApiError from '../exceptions/apiError.js';

class ProductVariantService {
  async createVariant(productId, name, description, price, image = '') {
    const variant = await ProductVariant.create({ productId, name, description, price, image });
    return variant;
  }

  async uploadVariantImage(variantId, imageUrl) {
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) throw ApiError.NotFound('Вариант товара не найден');

    variant.image = imageUrl;
    await variant.save();
    return variant;
  }

  async getVariantsByProduct(productId) {
    return ProductVariant.findAll({ where: { productId } });
  }
}

export default new ProductVariantService();
