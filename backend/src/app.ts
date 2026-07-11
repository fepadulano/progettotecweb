import express, { Application, Request, Response } from "express";
import cors from "cors";
import sequelize from "./config/database";
import "./models"; // registra le relazioni tra i modelli (vedi models/index.ts)

import authRoutes from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import userRoutes from "./routes/user.routes";
import publicGamesRoutes from "./routes/publicGames.routes";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", publicGamesRoutes);

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
