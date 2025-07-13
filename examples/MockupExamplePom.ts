import type { Page } from "@playwright/test";
import { ComponentObjectModel } from "../src/mod.ts";
import { Mockup } from "../src/mod.ts";

/**
 * Example component POM that demonstrates using the Mockup function
 * for creating browser window screenshots with custom overlays.
 */
export class MockupExamplePom extends ComponentObjectModel {
    constructor(page: Page) {
        super(page);
    }

    /**
     * Creates a mockup screenshot of the current page with a browser window overlay.
     * 
     * @param url - The URL to display in the browser address bar
     * @returns Promise<Uint8Array> - The mockup screenshot
     */
    async createBrowserMockup(url: string): Promise<Uint8Array> {
        this.log(`createBrowserMockup("${url}")`);
        
        return await Mockup({
            page: this.page,
            type: 'browser',
            url: url
        });
    }

    /**
     * Creates multiple mockup screenshots for different URLs.
     * Useful for creating a series of screenshots for documentation.
     * 
     * @param urls - Array of URLs to create mockups for
     * @returns Promise<Uint8Array[]> - Array of mockup screenshots
     */
    async createMultipleMockups(urls: string[]): Promise<Uint8Array[]> {
        this.log(`createMultipleMockups([${urls.join(', ')}])`);
        
        const mockups: Uint8Array[] = [];
        
        for (const url of urls) {
            const mockup = await this.createBrowserMockup(url);
            mockups.push(mockup);
        }
        
        return mockups;
    }

    /**
     * Example usage: Wait for page to load, then create a mockup.
     * 
     * @param url - The URL to display in the mockup
     */
    async waitAndMockup(url: string): Promise<Uint8Array> {
        this.log(`waitAndMockup("${url}")`);
        
        // Wait for the page to be ready
        await this.page.waitForLoadState('domcontentloaded');
        
        // Optional: wait for specific elements to be visible
        // await this.waitUntilVisible(this.locator('body'));
        
        // Create the mockup
        return await this.createBrowserMockup(url);
    }
}