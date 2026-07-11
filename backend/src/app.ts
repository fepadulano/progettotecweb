import express, { Application, Request, Response } from "express";
import cors from "cors";
import sequelize from "./config/database";
import "./models"; // registra le relazioni tra i modelli (vedi models/index.ts)

import rotteAutenticazione from "./routes/auth.routes";
import rottePartita from "./routes/game.routes";
import rotteUtenti from "./routes/user.routes";
import rottePartiteConcluse from "./routes/publicGames.routes";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/autenticazione", rotteAutenticazione);
app.use("/api/partita", rottePartita);
app.use("/api/utenti", rotteUtenti);
app.use("/api/partite-concluse", rottePartiteConcluse);

app.get("/", (req: Request, res: Response) => {
  res.json({ messaggio: "Benvenuto su WikiBlank API Backend con TypeScript!" });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server in esecuzione sulla porta ${PORT}`);

  try {
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
