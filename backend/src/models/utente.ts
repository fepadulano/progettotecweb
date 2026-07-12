import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Utente extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare punteggioTotale: number;
}

// tableName resta "Users" (tabella fisica già esistente), ma modelName può
// essere in italiano: essendo esplicito tableName, i due nomi sono scollegati
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
      field: "total_score",
    },
  },
  {
    sequelize: database,
    modelName: "Utente",
    tableName: "Users",
  },
);

export default Utente;
