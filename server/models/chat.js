import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import User from './user.js';

const Chat = sequelize.define('Chat', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  status:    { type: DataTypes.ENUM('register','process','closed'), defaultValue: 'register' },
}, {
  tableName: 'chats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

User.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(User, { foreignKey: 'userId' });

export default Chat;