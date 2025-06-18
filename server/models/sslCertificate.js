import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import User from './user.js';
import ProductVariant from './productVariant.js';

const SSLCertificate = sequelize.define('SSLCertificate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  userId: { type: DataTypes.INTEGER, allowNull: false },
  variantId: { type: DataTypes.INTEGER, allowNull: false },

  domain: { type: DataTypes.STRING, allowNull: false },
  serial: { type: DataTypes.STRING, allowNull: false, unique: true },
  validFrom: { type: DataTypes.DATE, allowNull: false },
  validTo: { type: DataTypes.DATE, allowNull: false },

  status: { type: DataTypes.STRING, defaultValue: 'active' },
  issuer: { type: DataTypes.STRING, allowNull: true },

  certificatePem: { type: DataTypes.TEXT, allowNull: true },
  privateKeyPem: { type: DataTypes.TEXT, allowNull: true },
  caBundlePem: { type: DataTypes.TEXT, allowNull: true },
  downloadUrl: { type: DataTypes.STRING, allowNull: true },

  renewalThresholdReached: { type: DataTypes.BOOLEAN, defaultValue: false },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'ssl_certificates',
  timestamps: true,
});

User.hasMany(SSLCertificate, { foreignKey: 'userId' });
SSLCertificate.belongsTo(User, { foreignKey: 'userId' });

ProductVariant.hasMany(SSLCertificate, { foreignKey: 'variantId' });
SSLCertificate.belongsTo(ProductVariant, { foreignKey: 'variantId' });

export default SSLCertificate;