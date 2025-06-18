import CartService from '../services/cartService.js';

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;
    const cartItem = await CartService.addProduct(userId, variantId, quantity);
    return res.json(cartItem);
  } catch (e) {
    next(e);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { variantId } = req.body;
    const result = await CartService.removeProduct(userId, variantId);
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await CartService.getCartItems(userId);
    return res.json(cartItems);
  } catch (e) {
    next(e);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Используем variantId вместо productId
    const { variantId, newQuantity } = req.body;
    const updated = await CartService.updateProductQuantity(userId, variantId, newQuantity);
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};
