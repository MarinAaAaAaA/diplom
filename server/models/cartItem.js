import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import Cart from './cart.js';
import ProductVariant from './productVariant.js';

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  variantId: { type: DataTypes.INTEGER, allowNull: false },
  cartId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'cart_items',
  timestamps: true,
});

Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

ProductVariant.hasMany(CartItem, { foreignKey: 'variantId' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

export default CartItem;