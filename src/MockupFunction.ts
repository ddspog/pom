import type { Page } from "@playwright/test";

/**
 * Options for the Mockup function that combines page, mockup settings, and screenshot options
 */
export interface MockupOptions {
    /** The Playwright page instance to take a screenshot of */
    page: Page;
    /** The type of mockup to create. Currently only 'browser' is supported */
    type: 'browser';
    /** The URL to display in the browser address bar */
    url: string;
    /** Screenshot type - 'png' or 'jpeg' */
    screenshotType?: 'png' | 'jpeg';
    /** Screenshot quality (0-100, only for jpeg) */
    quality?: number;
    /** Whether to take a screenshot of the full scrollable page */
    fullPage?: boolean;
    /** Capture screenshot beyond the viewport */
    clip?: { x: number; y: number; width: number; height: number };
    /** Animation handling */
    animations?: 'disabled' | 'allow';
    /** Caret handling */
    caret?: 'hide' | 'initial';
    /** Elements to mask in the screenshot */
    mask?: any[];
    /** Timeout for the screenshot operation */
    timeout?: number;
}

/**
 * Creates a mockup screenshot with a browser window overlay.
 * 
 * This function takes a screenshot of the provided page, then creates a new page 
 * with custom HTML that represents a stylized browser window. The HTML includes
 * a top bar with traffic lights, an address bar displaying the provided URL,
 * and the original screenshot as the page content.
 * 
 * @param options - Configuration options including page, mockup type, URL, and screenshot options
 * @returns Promise<Uint8Array> - The final mockup screenshot as a buffer
 * 
 * @example
 * ```typescript
 * const mockupScreenshot = await Mockup({
 *   page,
 *   type: 'browser',
 *   url: 'https://example.com',
 *   fullPage: true
 * });
 * ```
 */
export async function Mockup(options: MockupOptions): Promise<Uint8Array> {
    console.log(`[Mockup] Creating ${options.type} mockup for URL: ${options.url}`);
    
    // Validate options
    if (options.type !== 'browser') {
        throw new Error(`Unsupported mockup type: ${options.type}. Only 'browser' is currently supported.`);
    }

    const { page, url, type, screenshotType = 'png', ...screenshotOptions } = options;

    // Step 1: Take a screenshot of the current page
    console.log('[Mockup] Taking screenshot of current page');
    const originalScreenshot = await page.screenshot({ 
        type: screenshotType,
        ...screenshotOptions
    });
    
    // Step 2: Convert screenshot to base64 for embedding in HTML
    const screenshotBase64 = btoa(String.fromCharCode(...originalScreenshot));
    const mimeType = screenshotType === 'jpeg' ? 'image/jpeg' : 'image/png';
    const screenshotDataUrl = `data:${mimeType};base64,${screenshotBase64}`;
    
    // Step 3: Generate HTML with browser window mockup
    const mockupHtml = generateBrowserMockupHtml(url, screenshotDataUrl);
    
    // Step 4: Open a new page in the same browser context
    console.log('[Mockup] Creating new page for mockup');
    const mockupPage = await page.context().newPage();
    
    try {
        // Step 5: Set the HTML content
        await mockupPage.setContent(mockupHtml, { waitUntil: 'domcontentloaded' });
        
        // Step 6: Take a screenshot of the mockup page
        console.log('[Mockup] Taking final mockup screenshot');
        const mockupScreenshot = await mockupPage.screenshot({ type: 'png', fullPage: true });
        
        return mockupScreenshot;
    } finally {
        // Clean up: close the mockup page
        await mockupPage.close();
        console.log('[Mockup] Mockup page closed');
    }
}

/**
 * Generates the HTML content for the browser window mockup.
 * 
 * @param url - The URL to display in the address bar
 * @param screenshotDataUrl - The data URL of the screenshot to embed
 * @returns The complete HTML string for the mockup
 */
function generateBrowserMockupHtml(url: string, screenshotDataUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Mockup</title>
    <style>
        body {
            margin: 0;
            padding: 16px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div aria-label="Browser Window" style="border: 1px solid #ddd; border-radius: 8px; margin: 16px; max-width: 600px; font-family: Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div aria-label="Browser Top Bar" style="background: #f5f5f5; border-bottom: 1px solid #ddd; border-radius: 8px 8px 0 0; padding: 8px 12px; display: flex; align-items: center;">
            <div aria-label="Traffic Lights" style="display: flex; gap: 6px; margin-right: 12px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f57;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #28ca42;"></div>
            </div>
            <div aria-label="Address Bar" style="flex: 1; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #666;">
                <a target="_blank" style="color: #333; text-decoration: none; pointer-events: none;">
                    🔒 ${url}
                </a>
            </div>
        </div>
        <div aria-label="Browser Content" style="padding: 0;">
            <img alt="Page Screenshot" 
                style="width: 100%; height: auto; display: block; border-radius: 0 0 8px 8px;"
                src="${screenshotDataUrl}" 
            >
        </div>
    </div>
</body>
</html>`;
}