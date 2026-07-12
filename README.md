# WikiBlank

Gioco stile impiccato basato su Wikipedia: ad ogni partita viene selezionato un articolo casuale di Wikipedia in italiano, il cui testo viene oscurato. L'obiettivo è indovinare le parole che compongono l'articolo, oppure tentare direttamente il titolo.

Progetto universitario per il corso di Web Technologies (Federico II).

## Stack

- **Backend**: Node.js, Express, TypeScript, Sequelize (PostgreSQL), JWT per l'autenticazione
- **Frontend**: Angular, TypeScript

## Avvio

### Backend

```bash
cd backend
npm install
```

Crea un file `.env` in `backend/` con:

```
PORT=3000
DATABASE_URL=postgres://utente:password@localhost:5432/wikiblank_db
JWT_SECRET=una_stringa_casuale_e_segreta
```

Sostituisci `utente`/`password` con le credenziali del tuo Postgres locale (es.
`postgres:postgres` se non è stata cambiata la password di default). Serve un
database PostgreSQL locale chiamato `wikiblank_db`. Poi:

```bash
npm run dev
```

Il backend parte su `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Il frontend parte su `http://localhost:4200`.

### Test end-to-end

I test in `e2e/` attraversano tutto lo stack (frontend, backend, database e la vera
API di Wikipedia): avviano da soli sia il backend che il frontend, ma serve un
database Postgres raggiungibile e una connessione a internet.

```bash
cd e2e
npm install
npm test
```
