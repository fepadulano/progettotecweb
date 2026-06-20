import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Guess = sequelize.define("Guess", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  word: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Guess;
