import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class User extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare total_score: number;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    total_score: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  },
  {
    sequelize: database,
    modelName: "User",
    tableName: "Users",
  },
);

export default User;
