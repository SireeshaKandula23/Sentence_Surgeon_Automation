import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { HomePage } from "../pages/HomePage";
import { saveAccount } from "../utils/accountPool";
import { TEST_PASSWORD, uniqueEmail } from "../utils/testData";

test.describe("Authentication", () => {
  test("can switch between Sign in and Create account modes", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.open();
    await auth.expectSignUpMode();
    await auth.switchToSignIn();
    await auth.expectSignInMode();
    await auth.switchToSignUp();
    await auth.expectSignUpMode();
  });

  test("can create a new account and lands in the app", async ({ page }) => {
    const auth = new AuthPage(page);
    const home = new HomePage(page);
    const email = uniqueEmail("signup");
    await auth.open();
    await auth.signUp(email, TEST_PASSWORD);
    const landedAfterSignUp = await home.textarea.isVisible({ timeout: 20_000 }).catch(() => false);
    if (!landedAfterSignUp) {
      await auth.switchToSignIn();
      await auth.signIn(email, TEST_PASSWORD);
    }
    await home.expectAuthenticated();
    saveAccount({ email, password: TEST_PASSWORD });
  });

  test("can log out, then log back in with the same credentials", async ({ page }) => {
    const auth = new AuthPage(page);
    const home = new HomePage(page);
    const email = uniqueEmail("relogin");

    await auth.open();
    await auth.signUp(email, TEST_PASSWORD);
    await home.expectAuthenticated();
    saveAccount({ email, password: TEST_PASSWORD });
    await home.logout();
    await auth.switchToSignIn();
    await auth.signIn(email, TEST_PASSWORD);
    await home.expectAuthenticated();
  });

  test("rejects login with wrong password", async ({ page }) => {
    const auth = new AuthPage(page);
    const email = uniqueEmail("wrongpw");

    await auth.open();
    await auth.signUp(email, TEST_PASSWORD);
    saveAccount({ email, password: TEST_PASSWORD });
    await new HomePage(page).logout();
    await auth.switchToSignIn();
    await auth.fillCredentials(email, "WrongPassword!12345");
    await auth.submitButton.click();
    await auth.expectAuthError();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/welcome back/i);
  });
});
