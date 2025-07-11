import type { Locator, Page } from "@playwright/test";
import { ComponentObjectModel } from "../src/mod.ts";

/**
 * Example component POM for testing ComponentObjectModel base class.
 */
export class ExampleComponentPom extends ComponentObjectModel {
    constructor(page: Page) {
        super(page);
    }

    get testButton(): Locator {
        return this.getByRole("button", { name: "Test Button" });
    }

    get testInput(): Locator {
        return this.getByPlaceholder("Type here...");
    }

    async clickTestButton() {
        await this.click(this.testButton);
    }

    async fillTestInput(value: string) {
        await this.fill(this.testInput, value);
    }
}
