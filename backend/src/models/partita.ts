import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Partita extends Model {
  declare id: number;
  declare titoloArticolo: string;
  declare testoArticolo: string;
  declare stato: string;
  declare tentativi: number;
  declare punteggio: number;
  declare userId: number;
  declare paroleIndovinate: string[];
  // createdAt/updatedAt sono gestiti da Sequelize, e servono a calcolare il tempo impiegato
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// "field" mantiene invariato il nome della colonna fisica nel database (in
// inglese, già esistente), mentre in tutto il resto del codice si usa il
// nome della proprietà in italiano: nessuna migrazione, nessun dato perso.
// modelName resta "GameSession": è il nome con cui Sequelize ha già creato
// la tabella fisica, cambiarlo la farebbe cercare una tabella inesistente
Partita.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titoloArticolo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "article_title",
    },
    testoArticolo: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "article_text",
    },
    stato: {
      type: DataTypes.STRING,
      defaultValue: "IN_CORSO",
      field: "status",
    },
    tentativi: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "attempts_count",
    },
    punteggio: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "score",
    },
    paroleIndovinate: {
      type: DataTypes.JSON,
      defaultValue: [],
      field: "guessed_words",
    },
  },
  {
    sequelize: database,
    modelName: "GameSession",
  },
);

export default Partita;
