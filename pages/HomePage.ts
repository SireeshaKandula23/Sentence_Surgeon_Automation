import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

const TONES = ["Formal", "Casual", "Professional", "Concise", "Academic"] as const;
export type ToneName = (typeof TONES)[number];

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get textarea(): Locator {
    return this.page.locator('textarea');
  }

  get correctButton(): Locator {
    return this.page.getByRole("button", { name: /^correct$/i });
  }

  get clearButton(): Locator {
    return this.page.getByRole("button", { name: /^clear$/i });
  }

  get historyButton(): Locator {
    return this.page.getByRole("button", { name: /history/i }).or(this.page.locator("header button").nth(0));
  }

  get themeButton(): Locator {
    return this.page.getByRole("button", { name: /toggle theme|theme/i }).or(this.page.locator("header button").nth(1));
  }

  get accountButton(): Locator {
    return this.page.getByRole("button", { name: /^account$/i }).or(this.page.locator("header button").last());
  }

  get accountMenu(): Locator {
    return this.page.getByRole("menu").or(this.page.locator("[data-radix-popper-content-wrapper]"));
  }

  get signOutMenuItem(): Locator {
    return this.page.getByRole("menuitem", { name: /sign out|log ?out/i }).or(
      this.page.getByRole("button", { name: /sign out|log ?out/i })
    );
  }

  get deleteAccountMenuItem(): Locator {
    return this.page.getByRole("menuitem", { name: /delete account/i }).or(
      this.page.getByRole("button", { name: /delete account/i })
    );
  }

  get inlineChangesHeading(): Locator {
    return this.page.getByText(/inline changes/i).first();
  }

  get whyHeading(): Locator {
    return this.page.getByText(/why these changes/i).first();
  }

  get toneHeading(): Locator {
    return this.page.getByText(/tone rewrites/i).first();
  }

  get alternativesHeading(): Locator {
    return this.page.getByText(/alternative phrasings/i).first();
  }

  get activeToneText(): Locator {
    return this.page.locator('[role="tabpanel"][data-state="active"]').locator("p").first().or(
      this.page.locator('[role="tabpanel"][data-state="active"]').first()
    );
  }

  get alternativeItems(): Locator {
    return this.page.locator("ol li").or(
      this.alternativesHeading.locator("xpath=following::*[self::li or self::p][position() <= 12]")
    );
  }

  async expectAuthenticated(): Promise<void> {

    await expect(this.textarea).toBeVisible({
      timeout: 60000
    });
  
    await expect(this.historyButton).toBeVisible();
  
    await expect(this.accountButton).toBeVisible();
  }
  

  async openAccountMenu(): Promise<void> {
    const menuActions = this.signOutMenuItem.or(this.deleteAccountMenuItem).first();
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.accountButton.click();
      if ((await menuActions.count()) > 0) {
        await expect(menuActions).toBeVisible();
        return;
      }
      await this.page.keyboard.press("Enter").catch(() => undefined);
      if ((await menuActions.count()) > 0) {
        await expect(menuActions).toBeVisible();
        return;
      }
      await this.page.waitForTimeout(300 * attempt);
    }
    await expect(menuActions).toBeVisible();
  }

    async logout(): Promise<void> {
      try {
    
        await this.openAccountMenu();
    
        await this.signOutMenuItem.click();
    
        await expect(
          this.page.locator('input[type="email"]').first()
        ).toBeVisible({
          timeout: 60000
        });
    
      } catch {
    
        await this.page.context().clearCookies();
    
        await this.page.goto("/auth", {
          waitUntil: "domcontentloaded"
        });
    
        await expect(
          this.page.locator('input[type="email"]').first()
        ).toBeVisible({
          timeout: 60000
        });
      }
    }

  async openDeleteAccountDialog(): Promise<void> {
    await this.openAccountMenu();
    await this.deleteAccountMenuItem.click();
  }

  async openHistory(): Promise<void> {
    await this.historyButton.click();
  }

  async fillText(text: string): Promise<void> {
    await this.textarea.fill(text);
  }

  async correctText(text: string): Promise<void> {
    await this.fillText(text);
    await this.correctButton.click();
    await this.waitForResults();
  }

  async waitForResults(): Promise<void> {
    await expect(this.inlineChangesHeading).toBeVisible({ timeout: 30_000 });
    await expect(this.toneHeading).toBeVisible({ timeout: 30_000 });
    await expect(this.alternativesHeading).toBeVisible({ timeout: 30_000 });
  }

  async expectAllResultSections(): Promise<void> {
    await this.waitForResults();
    await expect(this.whyHeading).toBeVisible();
    await expect.poll(async () => (await this.page.locator("body").innerText()).length).toBeGreaterThan(200);
  }

  async selectToneTab(tone: ToneName): Promise<void> {
    const tab = this.page.getByRole("tab", { name: new RegExp(`^${tone}$`, "i") }).or(
      this.page.getByRole("button", { name: new RegExp(`^${tone}$`, "i") })
    );
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toBeVisible();
    await expect.poll(
      async () => ((await this.activeToneText.textContent().catch(() => "")) ?? "").trim().length,
      { timeout: 10_000 }
    ).toBeGreaterThan(20);
  }

  async expectToneTabsSwitchable(): Promise<void> {
    for (const tone of TONES) {
      await this.selectToneTab(tone);
    }
  }

  async expectAlternativePhrasingsNonEmpty(): Promise<void> {
    await expect(this.alternativesHeading).toBeVisible();
    await expect.poll(
      async () => {
        const bodyText = await this.page.locator("body").innerText();
        const afterHeading = bodyText.split(/ALTERNATIVE PHRASINGS/i)[1] ?? "";
        return (afterHeading.match(/\b\d\s*\./g) ?? []).length || (await this.alternativeItems.count());
      },
      { timeout: 10_000 }
    ).toBeGreaterThan(0);
  }

  async clearText(): Promise<void> {
    await expect(this.clearButton).toBeVisible();
    await this.clearButton.click();
    await expect(this.textarea).toHaveValue("");
  }

  async toggleThemeAndExpectChange(): Promise<void> {
    const html = this.page.locator("html");
    const before = await html.getAttribute("class");
    await this.themeButton.click();
    await expect.poll(async () => await html.getAttribute("class")).not.toBe(before);
  }
}
