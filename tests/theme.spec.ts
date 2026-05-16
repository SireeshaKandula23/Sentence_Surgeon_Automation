import { test } from "../fixtures/test";

test.describe("Theme toggle", () => {
  test("clicking the theme icon switches between dark and light", async ({ signedInUser }) => {
    await signedInUser.homePage.toggleThemeAndExpectChange();
  });
});
