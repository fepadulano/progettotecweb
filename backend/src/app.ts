import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database";
import User from "./models/user";
import GameSession from "./models/gameSession";
import Guess from "./models/guess";

// 3. Il nostro trucchetto per TypeScript, ora con tutti i modelli
console.log("Modelli caricati:", User.name, GameSession.name, Guess.name);

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

console.log("Modello caricato con successo:", User.name);

// Middleware
app.use(cors());
app.use(express.json());

// Rotta di test basilare
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Benvenuto su WikiBlank API Backend con TypeScript!" });
});

// Avvio del server
// Avvio del server e test del Database
app.listen(PORT, async () => {
  console.log(`🚀 Server in esecuzione sulla porta ${PORT}`);

  try {
    // Prova a connettersi a PostgreSQL
    await sequelize.authenticate();
    console.log(
      "✅ Connessione al database PostgreSQL stabilita con successo!",
    );

    await sequelize.sync({ force: false });
    console.log("✅ Tabelle del database sincronizzate!");
  } catch (error) {
    console.error("❌ Impossibile connettersi al database:", error);
  }
});
