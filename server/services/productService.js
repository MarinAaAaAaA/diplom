import Product from '../models/product.js';
import ApiError from '../exceptions/apiError.js';

class ProductService {
  async createProduct(name, description, image = '') {
    const existing = await Product.findOne({ where: { name } });
    if (existing) {
      throw ApiError.BadRequest('Товар с таким именем уже существует');
    }
    const product = await Product.create({ name, description, image });
    return product;
  }

  async getAllProducts() {
    return await Product.findAll();
  }

  async getProductById(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw ApiError.NotFound(`Товар с ID=${id} не найден`);
    }
    return product;
  }

  async updateProduct(id, name, description, price) {
    const product = await this.getProductById(id);
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    await product.save();
    return product;
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    await product.destroy();
    return { message: 'Товар успешно удалён' };
  }

  async updateProductImage(productId, imageUrl) {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw ApiError.NotFound(`Товар с ID=${productId} не найден`);
    }
    product.image = imageUrl;
    await product.save();
    return product;
  }
}

export default new ProductService();