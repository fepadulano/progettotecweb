import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const database = new Sequelize("wikiblank_db", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  logging: false, // disabilita i log delle query SQL nel terminale per non fare confusione
});

export default database;
