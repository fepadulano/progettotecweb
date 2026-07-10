import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class GameSession extends Model {
  declare id: number;
  declare article_title: string;
  declare article_text: string;
  declare status: string;
  declare attempts_count: number;
  declare score: number;
  declare userId: number;
  declare guessed_words: string[];
  // createdAt/updatedAt sono gestiti da Sequelize, e servono a calcolare il tempo impiegato
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

GameSession.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    article_title: { type: DataTypes.STRING, allowNull: false },
    article_text: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "IN_PROGRESS" },
    attempts_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    score: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    guessed_words: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    sequelize: database,
    modelName: "GameSession",
  },
);

export default GameSession;
