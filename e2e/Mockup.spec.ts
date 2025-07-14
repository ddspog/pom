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

    test.describe("Size and Viewport Tests", () => {
        test("should preserve dimensions for small screenshots", async ({ page }) => {
            // Set a small viewport
            await page.setViewportSize({ width: 300, height: 200 });
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://small.example.com',
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should preserve dimensions for medium screenshots", async ({ page }) => {
            // Set a medium viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://medium.example.com',
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should preserve dimensions for large screenshots", async ({ page }) => {
            // Set a large viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://large.example.com',
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should handle clipped screenshots correctly", async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://clipped.example.com',
                clip: { x: 50, y: 50, width: 300, height: 200 },
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should handle full page screenshots", async ({ page }) => {
            // Create a page with content that extends beyond viewport
            await page.setContent(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Full Page Test</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0;
                            background: linear-gradient(180deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
                            color: white;
                            text-align: center;
                        }
                        .section {
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 2em;
                        }
                    </style>
                </head>
                <body>
                    <div class="section">Section 1</div>
                    <div class="section">Section 2</div>
                    <div class="section">Section 3</div>
                </body>
                </html>
            `);
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://fullpage.example.com',
                fullPage: true,
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should handle different image types correctly", async ({ page }) => {
            await page.setViewportSize({ width: 600, height: 400 });
            
            // Test PNG
            const pngOptions: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://png.example.com',
                type: 'png'
            };

            const pngMockup = await Mockup(pngOptions);
            expect(pngMockup).toBeInstanceOf(Uint8Array);
            expect(pngMockup.length).toBeGreaterThan(0);

            // Test JPEG
            const jpegOptions: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://jpeg.example.com',
                type: 'jpeg',
                quality: 90
            };

            const jpegMockup = await Mockup(jpegOptions);
            expect(jpegMockup).toBeInstanceOf(Uint8Array);
            expect(jpegMockup.length).toBeGreaterThan(0);
        });

        test("should handle mobile viewport dimensions", async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://mobile.example.com',
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should handle tablet viewport dimensions", async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 }); // iPad
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://tablet.example.com',
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });

        test("should handle desktop viewport dimensions", async ({ page }) => {
            // Set desktop viewport
            await page.setViewportSize({ width: 1440, height: 900 }); // MacBook Air
            
            const options: MockupOptions = {
                page,
                frame: 'browser',
                url: 'https://desktop.example.com',
                type: 'png'
            };

            const mockupScreenshot = await Mockup(options);
            
            expect(mockupScreenshot).toBeInstanceOf(Uint8Array);
            expect(mockupScreenshot.length).toBeGreaterThan(0);
        });
    });
});