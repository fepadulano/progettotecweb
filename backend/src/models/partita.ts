import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Partita extends Model {
  declare id: number;
  declare titoloArticolo: string;
  declare testoArticolo: string;
  declare stato: string;
  declare tentativi: number;
  declare punteggio: number;
  declare idUtente: number;
  declare paroleIndovinate: string[];
  // createdAt/updatedAt sono gestiti da sequelize, e servono a calcolare il tempo impiegato
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Partita.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titoloArticolo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "titolo_articolo",
    },
    testoArticolo: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "testo_articolo",
    },
    stato: {
      type: DataTypes.STRING,
      defaultValue: "IN_CORSO",
    },
    tentativi: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    punteggio: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    paroleIndovinate: {
      type: DataTypes.JSON,
      defaultValue: [],
      field: "parole_indovinate",
    },
  },
  {
    sequelize: database,
    modelName: "Partita",
    tableName: "Partite",
  },
);

export default Partita;
