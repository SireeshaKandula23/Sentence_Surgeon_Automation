import { expect, type Locator, type Page } from "@playwright/test";

export class HistoryPanel {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get root(): Locator {
    return this.page.getByRole("dialog").filter({ hasText: /your history/i }).or(
      this.page.locator("text=Your history").locator("xpath=ancestor::*[@role='dialog'][1]")
    );
  }

  get heading(): Locator {
    return this.page.getByRole("heading", { name: /your history/i }).or(this.page.getByText(/your history/i));
  }

  get closeButton(): Locator {
    return this.root.getByRole("button", { name: /close/i }).or(this.root.locator("button").first());
  }

  get deleteButtons(): Locator {
    return this.root.getByRole("button", { name: /^delete$/i }).or(
      this.root.locator('button[aria-label="Delete"]')
    );
  }

  async expectOpen(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async expectHasEntries(): Promise<void> {
    await this.expectOpen();
    await expect.poll(async () => await this.deleteButtons.count(), { timeout: 10_000 }).toBeGreaterThan(0);
  }

  async itemCount(): Promise<number> {
    return this.deleteButtons.count();
  }

  async deleteFirstEntry(): Promise<void> {
    await this.expectHasEntries();
    const before = await this.itemCount();
    const button = this.deleteButtons.first();
    await button.scrollIntoViewIfNeeded();
    await button.click({ force: true });
    await expect.poll(async () => await this.itemCount(), { timeout: 10_000 }).toBeLessThan(before);
  }

  async deleteAllEntries(): Promise<void> {
    await this.expectOpen();
    while ((await this.itemCount()) > 0) {
      await this.deleteFirstEntry();
    }
  }

  async close(): Promise<void> {
    await this.page.keyboard.press("Escape").catch(() => undefined);
    if (await this.root.isVisible().catch(() => false)) {
      const close = this.root.getByRole("button", { name: /close/i }).first();
      await close.click({ force: true, timeout: 3_000 }).catch(async () => {
        await this.page.mouse.click(10, 10);
      });
    }
    await expect(this.root).toBeHidden();
  }
}
