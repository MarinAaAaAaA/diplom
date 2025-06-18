import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import Chat from './chat.js';

const Message = sequelize.define('Message', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  chatId:    { type: DataTypes.INTEGER, allowNull: false },
  sender:    { type: DataTypes.ENUM('user','operator'), allowNull: false },
  senderId:  { type: DataTypes.INTEGER, allowNull: true },
  content:   { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

Chat.hasMany(Message,  { foreignKey: 'chatId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });

export default Message;