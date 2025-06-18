import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import ProductVariant from './productVariant.js';

const StockCertificate = sequelize.define('StockCertificate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  variantId: { type: DataTypes.INTEGER, allowNull: false },

  status: { type: DataTypes.ENUM('free', 'reserved', 'used'), defaultValue: 'free' },

  certificatePem: { type: DataTypes.TEXT, allowNull: true },
  privateKeyPem: { type: DataTypes.TEXT, allowNull: true },
  caBundlePem: { type: DataTypes.TEXT, allowNull: true },

  downloadUrl: { type: DataTypes.STRING, allowNull: true },

  sslCertificateId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'ssl_stock',
  timestamps: true,
});

ProductVariant.hasMany(StockCertificate, { foreignKey: 'variantId' });
StockCertificate.belongsTo(ProductVariant, { foreignKey: 'variantId' });

export default StockCertificate;