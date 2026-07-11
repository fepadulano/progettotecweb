import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Guess extends Model {
  declare id: number;
  declare parolaTentata: string;
  declare corretta: boolean;
  declare sessionId: number;
  declare tentativoSulTitolo: boolean;
}

Guess.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    parolaTentata: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "word_attempted",
    },
    corretta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_correct",
    },
    tentativoSulTitolo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_title_guess",
    },
  },
  {
    sequelize: database,
    modelName: "Guess",
  },
);

export default Guess;
