import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Utente extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare punteggioTotale: number;
}

Utente.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    punteggioTotale: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "punteggio_totale",
    },
  },
  {
    sequelize: database,
    modelName: "Utente",
    tableName: "Utenti",
  },
);

export default Utente;
