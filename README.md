# WikiBlank

Gioco stile impiccato basato su Wikipedia: ad ogni partita viene selezionato un articolo casuale di Wikipedia in italiano, il cui testo viene oscurato. L'obiettivo è indovinare le parole che compongono l'articolo, oppure tentare direttamente il titolo.

Progetto per il corso di Tecnologie Web (Federico II) — traccia 4.B WEBTECH'S WIKIBLANK.

## Cosa serve prima di iniziare

- Node.js (va bene una versione recente, il progetto è stato sviluppato con la 24)
- PostgreSQL installato e in esecuzione in locale

## Backend

Entra nella cartella e installa le dipendenze:

```bash
cd backend
npm install
```

Crea il database vuoto (se non esiste già):

```bash
createdb wikiblank_db
```

oppure, da dentro `psql`:

```sql
CREATE DATABASE wikiblank_db;
```

Crea un file `.env` dentro `backend/` con questo contenuto:

```
PORT=3000
DATABASE_URL=postgres://utente:password@localhost:5432/wikiblank_db
JWT_SECRET=una_stringa_casuale_e_segreta
```

Sostituisci `utente`/`password` con le credenziali del tuo Postgres locale (di solito è `postgres:postgres`, a meno che tu non l'abbia cambiata durante l'installazione). `JWT_SECRET` può essere una stringa qualsiasi, serve solo a firmare i token di accesso.

Avvia il server:

```bash
npm run dev
```

Al primo avvio il backend si collega al database vuoto e crea da solo tutte le tabelle necessarie (non serve eseguire nessuna migrazione a mano). Se tutto va bene, in console compare la conferma della connessione e il server resta in ascolto su `http://localhost:3000`.

## Frontend

In un altro terminale:

```bash
cd frontend
npm install
npm start
```

Il frontend parte su `http://localhost:4200` e si aspetta di trovare il backend già su `http://localhost:3000`.

## Come si usa

Da `http://localhost:4200`: ci si registra, si fa login, e dalla home si preme "Inizia una partita". Il sito propone un articolo casuale di Wikipedia con il testo oscurato; si può provare a indovinare parole singole (rimangono scoperte ovunque compaiano nel testo) oppure tentare direttamente il titolo dell'articolo per vincere subito. C'è anche una classifica dei giocatori con più partite vinte e uno storico delle partite concluse, consultabile anche senza essere autenticati.

## Test end-to-end

I test in `e2e/` coprono l'intero flusso applicativo — frontend, backend, database e la vera API di Wikipedia — e avviano da soli sia il backend che il frontend, quindi non serve averli già in esecuzione. Serve però un database Postgres raggiungibile (stesso `.env` di sopra) e una connessione a internet, perché i test vanno davvero a pescare articoli reali da Wikipedia.

```bash
cd e2e
npm install
npm test
```
