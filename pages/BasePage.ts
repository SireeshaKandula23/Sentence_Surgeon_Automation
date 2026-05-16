import { expect, type Locator, type Page } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  /** Stable brand marker visible on both auth and app pages. */
  get brandMark(): Locator {
    return this.page.getByRole("link", { name: /sentence surgeon/i }).or(
      this.page.getByText(/sentence surgeon/i).first()
    );
  }

  /** Navigate to a path relative to baseURL and tolerate auth redirect races. */
  async goto(path = "/"): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await this.gotoOnce(path);
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const transientNetworkFailure =
          /ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_TIMED_OUT|ENOTFOUND/i.test(message);
        if (!transientNetworkFailure || attempt === 3) throw error;
        lastError = error;
        await this.page.waitForTimeout(1_500 * attempt);
      }
    }
    throw lastError;
  }

  protected async gotoOnce(path: string): Promise<void> {
    try {
      await this.page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const benign = /ERR_ABORTED|frame was detached|navigation interrupted/i.test(message);
      if (!benign) throw error;
    }

    await this.page.waitForLoadState("domcontentloaded", { timeout: 30_000 }).catch(() => undefined);
    await expect(this.brandMark).toBeVisible({ timeout: 20_000 });
  }
}
