import type { Locator, Page } from "@playwright/test";

/**
 * Base Page Object Model class for Playwright UI/component testing.
 *
 * This class provides:
 * - Playwright page instance management
 * - Common selector utilities with logging (getByText, getByRole, getByTestId, getByLabel, getByPlaceholder, getByAltText, locator)
 * - Consistent logging format for all interactions
 * - Utility actions: click, fill, hover, press, selectOption, waitUntilVisible/Hidden
 *
 * @remarks
 * Extend this class for all component-level POMs. For page-level POMs, extend {@link PageObjectModel}.
 *
 * @example
 * class NavbarPom extends ComponentObjectModel {
 *   async waitForReady() {
 *     await this.getByRole('navigation').waitFor();
 *   }
 * }
 *
 * // For page-level POMs, see PageObjectModel below.
 */
export abstract class ComponentObjectModel {
    /** The Playwright page instance used for all interactions */
    protected readonly page: Page;

    /** The class name used for logging (derived from constructor name) */
    private readonly className: string;

    /**
     * Creates a new ComponentObjectModel instance.
     *
     * @param page - The Playwright page instance to use for interactions
     */
    constructor(page: Page) {
        this.page = page;
        this.className = this.constructor.name;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ---- Locators -----------------------------------------------------------
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Gets the locator for the error message element.
     *
     * @returns A Playwright locator for the error message element
     */
    get $error(): Locator {
        this.log('$error');
        return this.locator('[aria-invalid="true"]');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ---- Utilities ----------------------------------------------------------
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Logs a POM method call with consistent formatting.
     * Format: [POM: ClassName] methodName(params)
     *
     * @param action - The action being performed (method name and params)
     */
    protected log(action: string): void {
        const logMessage = `[POM: ${this.className}] ${action}`;
        console.log(logMessage);
    }

    /**
     * Gets a description of a locator for logging purposes.
     *
     * @param locator - The Playwright locator to describe
     * @returns A string description of the locator
     */
    private async getLocatorDescription(locator: Locator): Promise<string> {
        try {
            // Try to get a useful description from the locator
            const locatorString = locator.toString();
            return await Promise.resolve(locatorString.replace('Locator@', ''));
        } catch {
            return await Promise.resolve('element');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ---- Page Methods -------------------------------------------------------
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Gets an element by its text content.
     *
     * @param text - The text content to search for
     * @param options - Optional Playwright locator options
     * @returns A Playwright locator for the element
     */
    protected getByText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]): Locator {
        this.log(`getByText(${typeof text === 'string' ? `"${text}"` : text.toString()})`);
        return this.page.getByText(text, options);
    }

    /**
     * Gets an element by its ARIA role.
     *
     * @param role - The ARIA role to search for
     * @param options - Optional Playwright locator options
     * @returns A Playwright locator for the element
     */
    protected getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
        this.log(`getByRole("${role}")`);
        return this.page.getByRole(role, options);
    }

    /**
     * Gets an element by its test ID.
     *
     * @param testId - The test ID to search for
     * @returns A Playwright locator for the element
     */
    protected getByTestId(testId: string | RegExp): Locator {
        this.log(`getByTestId(${typeof testId === 'string' ? `"${testId}"` : testId.toString()})`);
        return this.page.getByTestId(testId);
    }

    /**
     * Gets an element by its label text.
     *
     * @param text - The label text to search for
     * @param options - Optional Playwright locator options
     * @returns A Playwright locator for the element
     */
    protected getByLabel(text: string | RegExp, options?: Parameters<Page['getByLabel']>[1]): Locator {
        this.log(`getByLabel(${typeof text === 'string' ? `"${text}"` : text.toString()})`);
        return this.page.getByLabel(text, options);
    }

    /**
     * Gets an element by its placeholder text.
     *
     * @param text - The placeholder text to search for
     * @param options - Optional Playwright locator options
     * @returns A Playwright locator for the element
     */
    protected getByPlaceholder(text: string | RegExp, options?: Parameters<Page['getByPlaceholder']>[1]): Locator {
        this.log(`getByPlaceholder(${typeof text === 'string' ? `"${text}"` : text.toString()})`);
        return this.page.getByPlaceholder(text, options);
    }

    /**
     * Gets an element by its alt text.
     *
     * @param text - The alt text to search for
     * @param options - Optional Playwright locator options
     * @returns A Playwright locator for the element
     */
    protected getByAltText(text: string | RegExp, options?: Parameters<Page['getByAltText']>[1]): Locator {
        this.log(`getByAltText(${typeof text === 'string' ? `"${text}"` : text.toString()})`);
        return this.page.getByAltText(text, options);
    }

    /**
     * Gets an element using a CSS selector.
     *
     * @param selector - The CSS selector to use
     * @param options - Optional Playwright locator options (e.g., has, hasText)
     * @returns A Playwright locator for the element
     */
    protected locator(selector: string, options?: Parameters<Page['locator']>[1]): Locator {
        this.log(`locator("${selector}"${options ? `, ${JSON.stringify(options)}` : ''})`);
        return this.page.locator(selector, options);
    }

    /**
     * Presses a key or key combination.
     *
     * @param key - The key or key combination to press
     * @param options - Optional key press options
     */
    protected async press(key: string, options?: Parameters<Page['keyboard']['press']>[1]): Promise<void> {
        this.log(`press("${key}")`);
        await this.page.keyboard.press(key, options);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ---- Locator Methods ----------------------------------------------------
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Clicks on an element identified by the given locator.
     *
     * @param locator - The Playwright locator for the element to click
     * @param options - Optional click options
     */
    protected async click(locator: Locator, options?: Parameters<Locator['click']>[0]): Promise<void> {
        this.log(`click(${await this.getLocatorDescription(locator)})`);
        await locator.click({ ...options, force: true });
    }

    /**
     * Waits for an element to be visible.
     *
     * @param locator - The Playwright locator for the element
     * @param options - Optional visibility options
     */
    protected async waitUntilVisible(locator: Locator, options?: Parameters<Locator['waitFor']>[0]): Promise<void> {
        this.log(`waitUntilVisible(${await this.getLocatorDescription(locator)})`);
        await locator.waitFor({ state: 'visible', ...options });
    }

    /**
     * Waits for an element to be hidden.
     *
     * @param locator - The Playwright locator for the element
     * @param options - Optional visibility options
     */
    protected async waitUntilHidden(locator: Locator, options?: Parameters<Locator['waitFor']>[0]): Promise<void> {
        this.log(`waitUntilHidden(${await this.getLocatorDescription(locator)})`);
        await locator.waitFor({ state: 'hidden', ...options });
    }

    /**
     * Types text into an input element.
     *
     * @param locator - The Playwright locator for the input element
     * @param text - The text to type
     * @param options - Optional fill options
     */
    protected async fill(locator: Locator, text: string, options?: Parameters<Locator['fill']>[1]): Promise<void> {
        this.log(`fill(${await this.getLocatorDescription(locator)}, "${text}")`);
        await locator.fill(text, options);
    }

    /**
     * Hovers over an element.
     *
     * @param locator - The Playwright locator for the element to hover over
     * @param options - Optional hover options
     */
    protected async hover(locator: Locator, options?: Parameters<Locator['hover']>[0]): Promise<void> {
        this.log(`hover(${await this.getLocatorDescription(locator)})`);
        await locator.hover(options);
    }

    /**
     * Selects an option in a <select> element.
     *
     * @param locator - The Playwright locator for the <select> element
     * @param value - The value or values to select (string or Array<string>)
     * @param options - Optional select options (e.g., force, timeout)
     * @returns Promise that resolves when the selection is complete
     */
    protected async selectOption(
        locator: Locator,
        value: string | Array<string>,
        options?: Parameters<Locator['selectOption']>[1]
    ): Promise<void> {
        this.log(`selectOption(${await this.getLocatorDescription(locator)}, ${JSON.stringify(value)})${options ? `, ${JSON.stringify(options)}` : ''}`);
        await locator.selectOption(value, options);
    }
}