import Utente from "./utente";
import Partita from "./partita";
import Tentativo from "./tentativo";

Utente.hasMany(Partita, { foreignKey: "userId" });
Partita.belongsTo(Utente, { foreignKey: "userId" });

Partita.hasMany(Tentativo, { foreignKey: "sessionId" });
Tentativo.belongsTo(Partita, { foreignKey: "sessionId" });

export { Utente, Partita, Tentativo };
