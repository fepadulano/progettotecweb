import User from "./user";
import GameSession from "./gameSession";
import Guess from "./guess";

User.hasMany(GameSession, { foreignKey: "userId" });
GameSession.belongsTo(User, { foreignKey: "userId" });

GameSession.hasMany(Guess, { foreignKey: "sessionId" });
Guess.belongsTo(GameSession, { foreignKey: "sessionId" });

export { User, GameSession, Guess };
