import { test } from "@playwright/test";
import { Mockup } from "../src/mod.ts";

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

    test("Normal Screenshot", async ({ page }) => {
        await Mockup({
            page,
            frame: 'browser',
            path: 'mockups/browser.png',
            url: 'https://example.com/path?query=test&special=<>&"quotes"'
        });
    });

    test("Focused Screenshot", async ({ page }) => {
        await Mockup({
            page,
            frame: 'browser',
            path: 'mockups/browser.png',
            url: 'https://example.com/path?query=test&special=<>&"quotes"',
            focus: { selector: 'button' }
        });
    });
});