import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  get emailInput(): Locator {
    return this.page.locator('input[type="email"]').first();
  }

  get passwordInput(): Locator {
    return this.page.locator('input[type="password"]').first();
  }

  get submitButton(): Locator {
    return this.page.locator("form").getByRole("button").last();
  }

  get createOneButton(): Locator {
    return this.page.getByRole("button", { name: /^create one$/i });
  }

  get signInToggleButton(): Locator {
    return this.page
      .locator("p")
      .filter({ hasText: /already have an account/i })
      .getByRole("button", { name: /^sign in$/i })
      .or(
        this.page
          .locator("p")
          .filter({ hasText: /already have an account/i })
          .locator("button")
          .first()
      );
  }

  async open(): Promise<void> {
    await this.goto("/auth");
    await expect(this.heading).toBeVisible();
  }

  async currentMode(): Promise<"signin" | "signup"> {
    const submitText = ((await this.submitButton.textContent()) ?? "").trim();
    return /^sign in$/i.test(submitText) ? "signin" : "signup";
  }

  async switchToSignUp(): Promise<void> {
    if ((await this.currentMode()) === "signup") return;
    await this.createOneButton.click();
    await this.expectSignUpMode();
  }

  async switchToSignIn(): Promise<void> {
    if ((await this.currentMode()) === "signin") return;
    const candidateToggles = [
      this.signInToggleButton,
      this.page
        .locator("p")
        .filter({ hasText: /already have an account/i })
        .getByRole("button", { name: /sign in/i }),
      this.page.getByRole("button", { name: /^sign in$/i }).first()
    ];

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      for (const toggle of candidateToggles) {
        if ((await this.currentMode()) === "signin") break;
        if ((await toggle.count()) === 0) continue;
        await toggle.first().click({ timeout: 5_000 }).catch(() => undefined);
      }
      if ((await this.currentMode()) === "signin") break;
      await this.page.waitForTimeout(300 * attempt);
    }
    await this.expectSignInMode();
  }

  async expectSignUpMode(): Promise<void> {
    await expect(this.submitButton).toHaveText(/create account/i);
  }

  async expectSignInMode(): Promise<void> {
    await expect(this.submitButton).toHaveText(/^sign in$/i);
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }
    
  async signUp(email: string, password: string): Promise<void> {

      await this.switchToSignUp();
    
      await this.fillCredentials(email, password);
    
      await this.submitButton.click();

      await this.page.waitForLoadState('networkidle');
    
      await expect(this.page).toHaveURL(
        /english-sentence-surgeon/,
        { timeout: 60000 }
      );
    
    }  
  async signIn(email: string, password: string): Promise<void> {

    await this.switchToSignIn();
  
    await this.fillCredentials(email, password);
  
    await this.submitButton.click();

    await this.page.waitForLoadState('networkidle');
  
    await expect(this.page).toHaveURL(
      /english-sentence-surgeon/,
      { timeout: 60000 }
    );
  }

  async expectAuthError(): Promise<void> {
    const errorText = this.page.getByText(/invalid|wrong|unable|failed|password|credentials/i);
    await expect(errorText.first()).toBeVisible();
  }
}
