import { expect, test } from "@playwright/test";
import { ExamplePagePom } from "../examples/mod.ts";

// Minimal HTML for page-level test
const TEST_URL = "data:text/html,<button role=button aria-label='Test Button'>Test Button</button><input placeholder='Type here...'>";

test.describe("PageObjectModel", () => {
    test("goto, url property, and component usage", async ({ page }) => {
        const pom = new ExamplePagePom(page, TEST_URL);
        await pom.open();
        // url property
        expect(pom.url).toBe(TEST_URL);
        // component POM usage
        await expect(pom.component.testButton).toBeVisible();
        await pom.component.clickTestButton();
        await expect(pom.component.testInput).toBeVisible();
        await pom.component.fillTestInput("World");
        await expect(pom.component.testInput).toHaveValue("World");
    });
});
