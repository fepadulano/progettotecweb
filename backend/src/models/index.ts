import Utente from "./user";
import Partita from "./gameSession";
import Tentativo from "./guess";

Utente.hasMany(Partita, { foreignKey: "userId" });
Partita.belongsTo(Utente, { foreignKey: "userId" });

Partita.hasMany(Tentativo, { foreignKey: "sessionId" });
Tentativo.belongsTo(Partita, { foreignKey: "sessionId" });

export { Utente, Partita, Tentativo };
