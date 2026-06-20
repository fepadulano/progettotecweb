import { DataTypes } from "sequelize";
import sequelize from "../config/database";

// Definiamo la tabella 'Users' e i suoi campi
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Non possono esserci due utenti con lo stesso username
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // La password (hashata) è obbligatoria
  },
});

export default User;
