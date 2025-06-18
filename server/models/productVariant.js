import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import Product from './product.js';

const ProductVariant = sequelize.define('ProductVariant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Product, key: 'id' },
  },

  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.FLOAT, allowNull: false },

  validityMonths: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },

  ca: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ZeroSSL' },

  image: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'product_variants',
  timestamps: true,
});

Product.hasMany(ProductVariant, { foreignKey: 'productId' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

export default ProductVariant;
