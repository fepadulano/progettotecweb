import Utente from "./utente";
import Partita from "./partita";
import Tentativo from "./tentativo";

Utente.hasMany(Partita, { foreignKey: { name: "idUtente", field: "id_utente" } });
Partita.belongsTo(Utente, { foreignKey: { name: "idUtente", field: "id_utente" } });

Partita.hasMany(Tentativo, { foreignKey: { name: "idPartita", field: "id_partita" } });
Tentativo.belongsTo(Partita, { foreignKey: { name: "idPartita", field: "id_partita" } });

export { Utente, Partita, Tentativo };
