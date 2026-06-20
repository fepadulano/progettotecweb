import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const GameSession = sequelize.define("GameSession", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  article_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  article_text: {
    type: DataTypes.TEXT, // Usiamo TEXT invece di STRING perché l'articolo può essere lungo
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "IN_PROGRESS", // Quando crei la partita, parte in corso
  },
});
// Nota: Sequelize aggiunge da solo le colonne 'createdAt' (inizio partita) e 'updatedAt'!

export default GameSession;
