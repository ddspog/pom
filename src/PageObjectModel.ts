import type { Page } from '@playwright/test';
import { ComponentObjectModel } from './ComponentObjectModel.ts';

/**
 * Page-level Object Model for Playwright UI testing.
 *
 * Extends {@link ComponentObjectModel} and adds a `url` property and `goto()` navigation method.
 *
 * @typeParam TURL - The URL type for the page (usually string literal or string)
 *
 * @example
 * class HomePagePom extends PageObjectModel<'/home'> {
 *   constructor(page: Page) {
 *     super(page, '/home');
 *   }
 *   async open() {
 *     await this.goto();
 *   }
 * }
 *
 * @remarks
 * For page-level POMs, extend this class. For component-level POMs, use {@link ComponentObjectModel}.
 */
export abstract class PageObjectModel<TURL extends string> extends ComponentObjectModel {
    /** The URL for this page object */
    public readonly url: TURL;

    /**
     * Creates a new PageObjectModel instance.
     *
     * @param page - The Playwright page instance
     * @param url - The URL for this page
     */
    constructor(page: Page, url: TURL) { super(page); this.url = url; }

    /**
     * Navigates to the page's URL using Playwright's goto().
     */
    async goto(): Promise<void> {
        this.log(`goto(\"${this.url}\")`);
        await this.page.goto(this.url);
    }
}