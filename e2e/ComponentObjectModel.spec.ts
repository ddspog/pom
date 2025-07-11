import { expect, test } from "@playwright/test";
import { ExampleComponentPom } from "../examples/mod.ts";

// Minimal HTML for component-level test
test.describe("ComponentObjectModel", () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(`
            <button role="button" aria-label="Test Button">Test Button</button>
            <input placeholder="Type here..." />
        `);
    });

    test("getByRole, getByPlaceholder, click, fill, and logging", async ({ page }) => {
        const pom = new ExampleComponentPom(page);
        // getByRole
        const button = pom.testButton;
        await expect(button).toBeVisible();
        // click
        await pom.clickTestButton();
        // getByPlaceholder
        const input = pom.testInput;
        await expect(input).toBeVisible();
        // fill
        await pom.fillTestInput("Hello");
        await expect(input).toHaveValue("Hello");
    });
});
