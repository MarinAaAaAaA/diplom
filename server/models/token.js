import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import User from './user.js'

const Token = sequelize.define('Token', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Token.belongsTo(User, { foreignKey: 'userId' });

export default Token;
