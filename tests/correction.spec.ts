import { test, expect } from "../fixtures/test";
import { SAMPLE_TEXT } from "../utils/testData";

test.describe("Correction flow", () => {
  test("correcting text renders all result sections", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    await homePage.correctText(SAMPLE_TEXT);
    await homePage.expectAllResultSections();
  });

  test("tone rewrite tabs are all switchable", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    await homePage.correctText(SAMPLE_TEXT);
    await homePage.expectToneTabsSwitchable();
  });

  test("alternative phrasings list is non-empty", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    await homePage.correctText(SAMPLE_TEXT);
    await homePage.expectAlternativePhrasingsNonEmpty();
  });

  test("Clear empties the textarea", async ({ signedInUser }) => {
    const { homePage } = signedInUser;
    await homePage.fillText(SAMPLE_TEXT);
    await expect(homePage.textarea).toHaveValue(SAMPLE_TEXT);
    await homePage.clearText();
  });
});
