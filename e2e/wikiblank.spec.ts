import { test, expect, Page } from "@playwright/test";

// registra un utente con credenziali sempre diverse e fa subito il login,
// usato dai test che devono partire già autenticati
async function registerAndLogin(
  page: Page,
): Promise<{ email: string; password: string }> {
  const stamp = Date.now() + Math.floor(Math.random() * 1000);
  const email = `giocatore${stamp}@example.com`;
  const password = "Test1234";

  await page.goto("/register");
  await page.locator("#username").fill(`giocatore${stamp}`);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Registrati" }).click();
  await expect(page).toHaveURL("/login");

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entra" }).click();
  await expect(page).toHaveURL("/game");

  // aspetta che la partita abbia finito di caricare: sotto carico (più test
  // in parallelo che chiamano Wikipedia insieme) può volerci un po'
  await expect(page.locator(".guess-input")).toBeVisible({ timeout: 30000 });

  return { email, password };
}

test.describe("senza autenticazione", () => {
  test("un ospite vede i pulsanti Accedi e Registrati in home", async ({
    page,
  }) => {
    await page.goto("/home");

    const hero = page.locator(".hero-content");
    await expect(hero.getByRole("link", { name: "Accedi" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Registrati" })).toBeVisible();
  });

  test("il login vuoto mostra gli errori", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Entra" }).click();

    await expect(page.getByText("L'email è obbligatoria.")).toBeVisible();
    await expect(page.getByText("La password è obbligatoria.")).toBeVisible();
  });

  test("/game reindirizza a /login", async ({ page }) => {
    await page.goto("/game");

    await expect(page).toHaveURL("/login");
  });
});

test.describe("registrazione e login", () => {
  test("con un'email già usata mostra un errore", async ({ page }) => {
    const stamp = Date.now();
    const email = `duplicato${stamp}@example.com`;

    await page.goto("/register");
    await page.locator("#username").fill(`duplicato${stamp}`);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Test1234");
    await page.getByRole("button", { name: "Registrati" }).click();
    await expect(page).toHaveURL("/login");

    // stessa email, seconda registrazione: deve fallire
    await page.goto("/register");
    await page.locator("#username").fill(`duplicato2${stamp}`);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Test1234");
    await page.getByRole("button", { name: "Registrati" }).click();

    await expect(
      page.getByText("Un account con questa email esiste già."),
    ).toBeVisible();
  });

  test("login con password sbagliata mostra un errore", async ({ page }) => {
    const stamp = Date.now();
    const email = `passsbagliata${stamp}@example.com`;

    await page.goto("/register");
    await page.locator("#username").fill(`passsbagliata${stamp}`);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Test1234");
    await page.getByRole("button", { name: "Registrati" }).click();
    await expect(page).toHaveURL("/login");

    await page.locator("#email").fill(email);
    await page.locator("#password").fill("PasswordSbagliata");
    await page.getByRole("button", { name: "Entra" }).click();

    await expect(page.getByText("Password errata.")).toBeVisible();
  });
});

test.describe("partita (utente autenticato)", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("mostra un articolo vero e censurato", async ({ page }) => {
    await expect(page.locator(".wiki-text")).toContainText("_", {
      timeout: 20000,
    });
  });

  test("indovinare una parola presente nel testo la svela", async ({
    page,
  }) => {
    // "di" è tra le parole più comuni dell'italiano: praticamente certo
    // che compaia in un articolo enciclopedico vero
    await page.locator(".guess-input").fill("di");
    await page.getByRole("button", { name: "Indovina Parola" }).click();

    await expect(page.locator(".message")).toContainText("compare");
  });

  test("ritentare una parola già indovinata non consuma un altro tentativo", async ({
    page,
  }) => {
    await page.locator(".guess-input").fill("di");
    await page.getByRole("button", { name: "Indovina Parola" }).click();
    await expect(page.locator(".message")).toContainText("compare");

    await page.locator(".guess-input").fill("di");
    await page.getByRole("button", { name: "Indovina Parola" }).click();

    await expect(page.locator(".message")).toContainText("già svelato");
  });

  test("una parola inventata viene segnalata come assente", async ({
    page,
  }) => {
    await page.locator(".guess-input").fill("xyzquantumblorpxyz");
    await page.getByRole("button", { name: "Indovina Parola" }).click();

    await expect(page.locator(".message")).toContainText("non è presente");
  });

  test("abbandonare svela il testo originale", async ({ page }) => {
    await page.getByRole("button", { name: "Abbandona" }).click();

    await expect(
      page.getByRole("button", { name: "Gioca un'altra partita" }),
    ).toBeVisible();
    await expect(page.locator(".wiki-text")).not.toContainText("_");
  });
});
