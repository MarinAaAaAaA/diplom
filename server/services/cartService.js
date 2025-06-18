import Cart from '../models/cart.js';
import CartItem from '../models/cartItem.js';
import ProductVariant from '../models/productVariant.js';
import ApiError from '../exceptions/apiError.js';

class CartService {
  async getUserCart(userId) {
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }
    return cart;
  }

  async addProduct(userId, variantId, quantity = 1) {
    const cart = await this.getUserCart(userId);

    // Проверка на существование варианта
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
      throw ApiError.NotFound(`Вариант товара с ID=${variantId} не найден`);
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, variantId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cartId: cart.id, variantId, quantity });
    }
    return cartItem;
  }

  async removeProduct(userId, variantId) {
    const cart = await this.getUserCart(userId);
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, variantId }
    });
    if (!cartItem) {
      throw ApiError.BadRequest('Такого товара в корзине нет');
    }
    await cartItem.destroy();
    return { message: 'Товар удалён из корзины' };
  }

  async getCartItems(userId) {
    const cart = await this.getUserCart(userId);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [ProductVariant],
    });
    return items;
  }

  async updateProductQuantity(userId, variantId, newQuantity) {
    const cart = await this.getUserCart(userId);
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, variantId }
    });
    if (!cartItem) {
      throw ApiError.BadRequest('Такого товара в корзине нет');
    }
    if (newQuantity <= 0) {
      await cartItem.destroy();
      return { message: 'Товар удалён из корзины' };
    }
    cartItem.quantity = newQuantity;
    await cartItem.save();
    return cartItem;
  }
}

export default new CartService();