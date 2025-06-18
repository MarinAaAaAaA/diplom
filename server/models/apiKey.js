import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import User from './user.js';

const ApiKey = sequelize.define('ApiKey', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },

  key:       { type: DataTypes.STRING,  allowNull: false, unique: true },
  hash:      { type: DataTypes.STRING,  allowNull: false, unique: true },

  createdAt: { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
  revokedAt: { type: DataTypes.DATE,    allowNull: true },
}, {
  tableName: 'api_keys',
  timestamps: false,
});

User.hasMany(ApiKey, { foreignKey: 'userId' });
ApiKey.belongsTo(User, { foreignKey: 'userId' });

export default ApiKey;