import Utente from "./utente";
import Partita from "./partita";
import Tentativo from "./tentativo";

// il nome della proprietà JS (userId/sessionId) resta invariato, solo la
// colonna fisica sottostante è stata rinominata in italiano
Utente.hasMany(Partita, { foreignKey: { name: "userId", field: "id_utente" } });
Partita.belongsTo(Utente, { foreignKey: { name: "userId", field: "id_utente" } });

Partita.hasMany(Tentativo, { foreignKey: { name: "sessionId", field: "id_partita" } });
Tentativo.belongsTo(Partita, { foreignKey: { name: "sessionId", field: "id_partita" } });

export { Utente, Partita, Tentativo };
