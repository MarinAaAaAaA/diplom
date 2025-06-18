import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import User from './user.js';

const Cart = sequelize.define('Cart', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true
  },
}, {
  tableName: 'carts',
  timestamps: true,
});

User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

export default Cart;
