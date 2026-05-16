import { expect, type Locator, type Page } from "@playwright/test";

export class DeleteAccountDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get root(): Locator {
    return this.page.getByRole("alertdialog").or(this.page.getByRole("dialog")).filter({ hasText: /delete your account/i });
  }

  get cancelButton(): Locator {
    return this.root.getByRole("button", { name: /^cancel$/i });
  }

  get confirmButton(): Locator {
    return this.root.getByRole("button", { name: /^delete account$/i });
  }

  async expectOpen(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.confirmButton).toBeVisible();
  }

  async cancel(): Promise<void> {
    await this.expectOpen();
    await this.cancelButton.click();
    await expect(this.root).toBeHidden();
  }

  async confirmDelete(): Promise<void> {
    await this.expectOpen();
    await this.confirmButton.click();
    await expect(this.page).toHaveURL(/\/auth\/?$/);
  }
}
