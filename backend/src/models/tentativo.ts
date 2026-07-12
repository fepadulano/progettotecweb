import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Tentativo extends Model {
  declare id: number;
  declare parolaTentata: string;
  declare corretta: boolean;
  declare sessionId: number;
  declare tentativoSulTitolo: boolean;
}

Tentativo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    parolaTentata: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "parola_tentata",
    },
    corretta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    tentativoSulTitolo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "tentativo_titolo",
    },
  },
  {
    sequelize: database,
    modelName: "Tentativo",
    tableName: "Tentativi",
  },
);

export default Tentativo;
