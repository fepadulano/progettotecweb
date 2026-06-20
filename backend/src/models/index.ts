import User from "./user";
import GameSession from "./gameSession";
import Guess from "./guess";

// 1. Definiamo qui le Relazioni (lontano da app.ts!)
User.hasMany(GameSession, { foreignKey: "userId" });
GameSession.belongsTo(User, { foreignKey: "userId" });

GameSession.hasMany(Guess, { foreignKey: "sessionId" });
Guess.belongsTo(GameSession, { foreignKey: "sessionId" });

// 2. Esportiamo i modelli già "collegati"
export { User, GameSession, Guess };
