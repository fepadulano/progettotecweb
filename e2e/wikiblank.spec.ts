import { test, expect } from '@playwright/test';

/**
 * Questi test attraversano tutto lo stack: frontend, backend, database Postgres
 * e (per l'avvio di una partita) la vera API di Wikipedia. Servono quindi sia
 * il backend che il frontend avviati (vedi playwright.config.ts, li fa partire
 * in automatico) e una connessione a internet.
 */

test('un utente si registra, gioca un turno e poi esce', async ({ page }) => {
  // credenziali uniche per ogni run, per non scontrarsi con utenti già registrati
  const stamp = Date.now();
  const username = `giocatore${stamp}`;
  const email = `giocatore${stamp}@example.com`;
  const password = 'Test1234';

  await test.step('registrazione', async () => {
    await page.goto('/register');
    await page.locator('#username').fill(username);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Registrati' }).click();

    await expect(page.getByText('Registrazione completata!', { exact: false })).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  await test.step('login con le credenziali appena create', async () => {
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Entra' }).click();

    await expect(page).toHaveURL('/game');
  });

  await test.step('la partita si avvia con un articolo vero e censurato', async () => {
    await expect(page.locator('.wiki-text')).toContainText('_', { timeout: 20000 });
  });

  await test.step('una parola inventata viene segnalata come assente', async () => {
    await page.locator('.guess-input').fill('xyzquantumblorpxyz');
    await page.getByRole('button', { name: 'Indovina Parola' }).click();

    await expect(page.locator('.message')).toContainText('non è presente');
  });

  await test.step('abbandonare svela il testo originale', async () => {
    await page.getByRole('button', { name: 'Abbandona' }).click();

    await expect(page.getByRole('button', { name: "Gioca un'altra partita" })).toBeVisible();
    await expect(page.locator('.wiki-text')).not.toContainText('_');
  });

  await test.step('il logout riporta allo stato ospite', async () => {
    await page.getByRole('button', { name: 'Esci' }).click();

    await expect(page).toHaveURL('/home');
    await expect(page.locator('.nav-auth').getByRole('link', { name: 'Accedi' })).toBeVisible();

    await page.goto('/game');
    await expect(page).toHaveURL('/login');
  });
});

test('un ospite vede i pulsanti Accedi e Registrati in home', async ({ page }) => {
  await page.goto('/home');

  const hero = page.locator('.hero-content');
  await expect(hero.getByRole('link', { name: 'Accedi' })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Registrati' })).toBeVisible();
});

test('il login vuoto mostra gli errori "obbligatoria"', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Entra' }).click();

  await expect(page.getByText("L'email è obbligatoria.")).toBeVisible();
  await expect(page.getByText('La password è obbligatoria.')).toBeVisible();
});

test('senza autenticazione /game reindirizza a /login', async ({ page }) => {
  await page.goto('/game');

  await expect(page).toHaveURL('/login');
});
