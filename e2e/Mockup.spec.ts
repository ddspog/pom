import { expect, test } from "@playwright/test";
import { Mockup, type MockupOptions } from "../src/mod.ts";

test.describe("Mockup Function", () => {
    test.beforeEach(async ({ page }) => {
        // Create a simple test page with some content
        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Page</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                        color: white;
                        text-align: center;
                    }
                    .content {
                        background: rgba(0,0,0,0.2);
                        padding: 40px;
                        border-radius: 10px;
                        margin: 20px auto;
                        max-width: 400px;
                    }
                </style>
            </head>
            <body>
                <div class="content">
                    <h1>Test Page</h1>
                    <p>This is a test page for the Mockup function.</p>
                    <button>Click me!</button>
                </div>
            </body>
            </html>
        `);
    });

    test("should handle different URLs correctly", async ({ page }) => {
        const testUrls = [
            'https://localhost:3000',
            'http://example.com/dashboard',
            'https://app.mysite.com/login'
        ];

        for (const url of testUrls) {
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: url,
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        }
    });

    test("should handle special characters in URL", async ({ page }) => {
        const options: MockupOptions = {
            page,
            frame: 'browser',
            path: 'mockups/browser.png',
            url: 'https://example.com/path?query=test&special=<>&"quotes"'
        };

        const mockupScreenshot = await Mockup(options);
        
        expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
        expect(mockupScreenshot.length).toBeGreaterThan(0);
    });

    test("should work with empty page", async ({ page }) => {
        // Navigate to a blank page
        await page.goto('about:blank');

        const options: MockupOptions = {
            page,
            frame: 'browser',
            url: 'https://blank-page.com'
        };

        const mockupScreenshot = await Mockup(options);
        
        expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
        expect(mockupScreenshot.length).toBeGreaterThan(0);
    });

    test("should preserve original page state", async ({ page }) => {
        // Get initial page content
        const initialTitle = await page.title();
        const initialContent = await page.content();

        const options: MockupOptions = {
            page,
            frame: 'browser',
            url: 'https://example.com/test'
        };

        await Mockup(options);

        // Verify the original page is unchanged
        const finalTitle = await page.title();
        const finalContent = await page.content();
        
        expect(finalTitle).toBe(initialTitle);
        expect(finalContent).toBe(initialContent);
    });
});