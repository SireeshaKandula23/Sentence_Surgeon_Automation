import { test } from "../fixtures/test";
import { DeleteAccountDialog } from "../pages/DeleteAccountDialog";

test.describe("Delete account", () => {
  test("Cancel closes the dialog and keeps the user logged in", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    const dialog = new DeleteAccountDialog(homePage.page);

    await homePage.openDeleteAccountDialog();
    await dialog.cancel();
    await homePage.expectAuthenticated();
  });

  test("Confirm permanently deletes the account and routes to /auth", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    const dialog = new DeleteAccountDialog(homePage.page);

    await homePage.openDeleteAccountDialog();
    await dialog.confirmDelete();
  });
});
