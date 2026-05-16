import { test } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { DeleteAccountDialog } from "../pages/DeleteAccountDialog";
import { HistoryPanel } from "../pages/HistoryPanel";
import { HomePage } from "../pages/HomePage";
import { SAMPLE_TEXT, TEST_PASSWORD, uniqueEmail } from "../utils/testData";

test("end-to-end: signup → correct → theme → history → logout → login → delete", async ({ page }) => {
  const email = uniqueEmail("e2e");
  const auth = new AuthPage(page);
  const home = new HomePage(page);
  const history = new HistoryPanel(page);
  const deleteDialog = new DeleteAccountDialog(page);

  await auth.open();
  await auth.signUp(email, TEST_PASSWORD);
  await home.expectAuthenticated();

  await home.correctText(SAMPLE_TEXT);
  await home.expectAllResultSections();
  await home.toggleThemeAndExpectChange();

  await home.openHistory();
  await history.expectHasEntries();
  await history.close();

  await home.logout();
  await auth.switchToSignIn();
  await auth.signIn(email, TEST_PASSWORD);
  await home.expectAuthenticated();

  await home.openDeleteAccountDialog();
  await deleteDialog.confirmDelete();
});
