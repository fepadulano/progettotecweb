import { test, expect } from '@playwright/test';

/**
 * 10 test e2e semplici su WikiBlank, pensati come esercizio di studio.
 *
 * Ogni test segue lo stesso schema in 3 passi (pattern Arrange-Act-Assert):
 *   1. page.goto(...)              -> vai su una pagina
 *   2. page.getByRole/getByLabel   -> trova un elemento
 *   3. expect(...)                 -> verifica il risultato
 *
 * Comandi utili per ripassare:
 *   npx playwright test              esegue tutti i test
 *   npx playwright test --ui         apre la modalità interattiva
 *   npx playwright show-report       apre il report HTML
 */

// 1. La home page si carica e mostra il titolo del sito
test('la home mostra il titolo WikiBlank', async ({ page }) => {
  await page.goto('/home');

  await expect(page.getByRole('heading', { name: 'WikiBlank' })).toBeVisible();
});

// 2. Un visitatore non autenticato vede i pulsanti "Accedi" e "Registrati" nell'hero della home
test('un ospite vede i pulsanti Accedi e Registrati in home', async ({ page }) => {
  await page.goto('/home');

  const hero = page.locator('.hero-content');
  await expect(hero.getByRole('link', { name: 'Accedi' })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Registrati' })).toBeVisible();
});

// 3. Il link "Accedi" nella barra di navigazione porta alla pagina di login
test('cliccando su Accedi nella navbar si arriva a /login', async ({ page }) => {
  await page.goto('/home');

  await page.locator('.nav-auth').getByRole('link', { name: 'Accedi' }).click();

  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'Accedi al Gioco' })).toBeVisible();
});

// 4. Il link "Registrati" nella barra di navigazione porta alla pagina di registrazione
test('cliccando su Registrati nella navbar si arriva a /register', async ({ page }) => {
  await page.goto('/home');

  await page.locator('.nav-auth').getByRole('link', { name: 'Registrati' }).click();

  await expect(page).toHaveURL('/register');
  await expect(page.getByRole('heading', { name: 'Crea un Account' })).toBeVisible();
});

// 5. Inviare il form di login vuoto mostra gli errori di validazione
test('il login vuoto mostra gli errori "obbligatoria"', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Entra' }).click();

  await expect(page.getByText("L'email è obbligatoria.")).toBeVisible();
  await expect(page.getByText('La password è obbligatoria.')).toBeVisible();
});

// 6. Dalla pagina di login si può raggiungere la registrazione tramite il link in fondo
test('il link "Registrati qui" nel login porta a /register', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('link', { name: 'Registrati qui' }).click();

  await expect(page).toHaveURL('/register');
});

// 7. Un username troppo corto in registrazione mostra l'errore di minlength
test('la registrazione con username troppo corto mostra un errore', async ({ page }) => {
  await page.goto('/register');

  await page.locator('#username').fill('ab'); // minimo richiesto: 3 caratteri
  await page.getByRole('button', { name: 'Registrati' }).click();

  await expect(page.getByText('Lo username deve avere almeno 3 caratteri.')).toBeVisible();
});

// 8. Dalla pagina di registrazione si può tornare al login tramite il link in fondo
test('il link "Accedi qui" nella registrazione porta a /login', async ({ page }) => {
  await page.goto('/register');

  await page.getByRole('link', { name: 'Accedi qui' }).click();

  await expect(page).toHaveURL('/login');
});

// 9. La rotta /game è protetta: senza login si viene reindirizzati al login
test('senza autenticazione /game reindirizza a /login', async ({ page }) => {
  await page.goto('/game');

  await expect(page).toHaveURL('/login');
});

// 10. La pagina della classifica mostra la sua intestazione
test('la pagina /leaderboard mostra il titolo Classifica', async ({ page }) => {
  await page.goto('/leaderboard');

  await expect(page.getByRole('heading', { name: 'Classifica' })).toBeVisible();
});
