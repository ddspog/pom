import type { Page } from "@playwright/test";
import { PageObjectModel } from "../src/mod.ts";
import { ExampleComponentPom } from "./ExampleComponentPom.ts";

/**
 * Example page POM for testing PageObjectModel base class.
 */
export class ExamplePagePom extends PageObjectModel<string> {
    public readonly component: ExampleComponentPom;

    constructor(page: Page, url: string) {
        super(page, url);
        this.component = new ExampleComponentPom(page);
    }

    async open() {
        await this.goto();
    }
}
