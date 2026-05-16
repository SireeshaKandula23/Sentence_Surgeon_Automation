import { test, expect } from "../fixtures/test";
import { HistoryPanel } from "../pages/HistoryPanel";
import { SAMPLE_TEXT, SECOND_SAMPLE_TEXT } from "../utils/testData";

test.describe("History", () => {
  test("a successful correction shows up in history and can be deleted", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    const history = new HistoryPanel(homePage.page);

    await homePage.correctText(SAMPLE_TEXT);
    await homePage.openHistory();
    await history.expectHasEntries();
    await history.deleteFirstEntry();
    await expect.poll(async () => await history.itemCount()).toBe(0);
  });

  test("multiple corrections accumulate, then delete one by one", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    const history = new HistoryPanel(homePage.page);

    await homePage.correctText(SAMPLE_TEXT);
    await homePage.correctText(SECOND_SAMPLE_TEXT);
    await homePage.openHistory();
    await history.expectHasEntries();
    await expect.poll(async () => await history.itemCount()).toBeGreaterThan(1);
    await history.deleteAllEntries();
    await expect.poll(async () => await history.itemCount()).toBe(0);
  });
});
