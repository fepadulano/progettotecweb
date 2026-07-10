import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Guess extends Model {
  declare id: number;
  declare word_attempted: string;
  declare is_correct: boolean;
  declare sessionId: number;
  declare is_title_guess: boolean;
}

Guess.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    word_attempted: { type: DataTypes.STRING, allowNull: false },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_title_guess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    modelName: "Guess",
  },
);

export default Guess;
