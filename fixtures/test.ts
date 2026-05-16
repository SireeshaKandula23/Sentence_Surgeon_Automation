import { test as base } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { HomePage } from "../pages/HomePage";
import { loadStoredAccounts, saveAccount, type StoredAccount } from "../utils/accountPool";
import { TEST_PASSWORD, uniqueEmail } from "../utils/testData";

type SignedInUser = {
  email: string;
  password: string;
  homePage: HomePage;
};

type Fixtures = {
  signedInUser: SignedInUser;
};

let reusableAccount: { email: string; password: string } | null = null;

export const test = base.extend<Fixtures>({
  signedInUser: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    const homePage = new HomePage(page);
    const password = TEST_PASSWORD;
    const configuredEmail = process.env.TEST_EMAIL;
    let email = reusableAccount?.email ?? uniqueEmail("signedin");

    const tryLandInApp = async (): Promise<boolean> => {
      const textareaVisible = await homePage.textarea.isVisible({ timeout: 45_000 }).catch(() => false);
      if (textareaVisible) return true;
      if (!/\/auth\/?\??/i.test(page.url())) {
        const accountVisible = await homePage.accountButton.isVisible({ timeout: 10_000 }).catch(() => false);
        if (accountVisible) return true;
      }
      return false;
    };

    const trySignIn = async (candidateEmail: string): Promise<boolean> => {
      try {
        await authPage.open();
        const signInToggle = page
          .locator("p")
          .filter({ hasText: /already have an account/i })
          .getByRole("button", { name: /sign in/i });
        if ((await signInToggle.count()) > 0) {
          await signInToggle.first().click();
        }
        await page.locator('input[type="email"]').first().fill(candidateEmail);
        await page.locator('input[type="password"]').first().fill(password);
        const signInSubmit = page.locator("form").getByRole("button", { name: /^sign in$/i }).first();
        await signInSubmit.click();
        await page.waitForURL((url) => !/\/auth\/?\??/i.test(url.href), { timeout: 20_000 }).catch(() => undefined);
        return await tryLandInApp();
      } catch {
        return false;
      }
    };

    const storedAccounts = loadStoredAccounts();

    if (configuredEmail) {
      const signedInConfigured = await trySignIn(configuredEmail);
      if (!signedInConfigured) {
        throw new Error("TEST_EMAIL is configured but login failed.");
      }
      reusableAccount = { email: configuredEmail, password };
      email = configuredEmail;
    }

    if (!configuredEmail && reusableAccount) {
      const signedInWithReusable = await trySignIn(reusableAccount.email);
      if (!signedInWithReusable) {
        reusableAccount = null;
      }
    }

    if (!configuredEmail && !reusableAccount) {
      const candidates: StoredAccount[] = storedAccounts.filter((candidate) => candidate.password === password);
      for (const candidate of candidates) {
        if (await trySignIn(candidate.email)) {
          reusableAccount = candidate;
          saveAccount(candidate);
          break;
        }
      }
    }

    if (!configuredEmail && !reusableAccount) {
      let signedIn = false;
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        email = uniqueEmail(`signedin${attempt}`);
        await authPage.open();
        await authPage.signUp(email, password);
        if (await tryLandInApp()) {
          signedIn = true;
          break;
        }
        if (await trySignIn(email)) {
          signedIn = true;
          break;
        }
        await page.goto("/auth", { waitUntil: "domcontentloaded" }).catch(() => undefined);
      }
      if (!signedIn) {
        throw new Error("Could not create and sign in a fresh user after 4 attempts.");
      }
      reusableAccount = { email, password };
      saveAccount(reusableAccount);
    } else if (!configuredEmail) {
      email = reusableAccount.email;
    }

    await homePage.expectAuthenticated();

    await use({ email, password, homePage });
  }
});

export { expect } from "@playwright/test";
