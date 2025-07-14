import type { Locator, Page } from "@playwright/test";

type ScreenshotOptions = {
    /** Animation handling */
    animations?: 'disabled' | 'allow';
    /** Caret handling */
    caret?: 'hide' | 'initial';
    /** An object which specifies clipping of the resulting image. */
    clip?: {
        /** x-coordinate of top-left corner of clip area */
        x: number;
        /** y-coordinate of top-left corner of clip area */
        y: number;
        /** width of clipping area */
        width: number;
        /** height of clipping area */
        height: number;
    };
    /** Whether to take a screenshot of the full scrollable page */
    fullPage?: boolean;
    /** Elements to mask in the screenshot */
    mask?: Array<Locator>;
    /** Specify the color of the overlay box for masked elements, in [CSS color format](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). Default color is pink `#FF00FF`. */
    maskColor?: string;
    /** Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images. Defaults to `false`. */
    omitBackground?: boolean;
    /** The file path to save the image to. The screenshot type will be inferred from file extension. If [`path`](https://playwright.dev/docs/api/class-page#page-screenshot-option-path) is a relative path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to the disk. */
    path?: string;
    /** Screenshot quality (0-100, only for jpeg) */
    quality?: number;
    /** When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large or even larger. Defaults to `"device"`. */
    scale?: "css" | "device";
    /** Text of the stylesheet to apply while making the screenshot. This is where you can hide dynamic elements, make elements invisible or change their properties to help you creating repeatable screenshots. This stylesheet pierces the Shadow DOM and applies to the inner frames. */
    style?: string;
    /** Timeout for the screenshot operation */
    timeout?: number;
    /** Specify screenshot type, defaults to `png`. */
    type?: "png" | "jpeg";
}

type BrowserOptions = {
    /** The type of mockup to create. Currently only 'browser' is supported */
    frame: 'browser';
    /** The URL to display in the browser address bar */
    url: string;
}

/**
 * Options for the Mockup function that combines page, mockup settings, and screenshot options
 */
export type MockupOptions = ScreenshotOptions & BrowserOptions & {
    /** The Playwright page instance to take a screenshot of */
    page: Page;
}

/**
 * Creates a mockup screenshot with a browser window overlay.
 * 
 * This function takes a screenshot of the provided page using the specified options,
 * then creates a stylized browser window frame around it. The frame includes macOS-style
 * traffic lights, an address bar with the provided URL, and embeds the original screenshot
 * as the page content.
 * 
 * The function supports all standard Playwright screenshot options including fullPage,
 * quality, type, clipping, masking, and more.
 * 
 * @param options - Configuration object containing the page, frame type, URL, and screenshot options
 * @returns Promise<Uint8Array> - The final mockup screenshot as a PNG buffer
 * 
 * @example
 * ```typescript
 * import { Mockup } from '@ddspog/pom';
 * 
 * // Create a browser window mockup with full page screenshot
 * const mockupScreenshot = await Mockup({
 *   page,
 *   frame: 'browser',
 *   url: 'https://example.com',
 *   fullPage: true,
 *   type: 'png'
 * });
 * 
 * // Save the enhanced screenshot
 * await Deno.writeFile('docs/screenshot.png', mockupScreenshot);
 * ```
 */
export async function Mockup({ page, url, frame: _, path, type, ...options }: MockupOptions): Promise<Uint8Array> {
    const screenshot = await page.screenshot({ type, ...options });
    const dataURL = `data:${
        type === 'jpeg' ? 'image/jpeg' : 'image/png'
    };base64,${
        btoa(new Uint8Array(screenshot).reduce((data, byte) => data + String.fromCharCode(byte), ''))
    }`;
    
    // Get screenshot dimensions to preserve size in the final mockup
    const screenshotDimensions = await getImageDimensions(dataURL, page);
    
    const mockupPage = await page.context().newPage();

    try {
        await mockupPage.setContent(
            MountBrowserMockup(url, dataURL, screenshotDimensions),
            { waitUntil: 'domcontentloaded' }
        );
        return await mockupPage
            .locator('[aria-label="Browser Window"]')
            .screenshot({ type: 'png', path, omitBackground: true });
    } finally {
        await mockupPage.close();
    }
}

/**
 * Extracts dimensions from an image data URL using a temporary page
 * 
 * @param dataURL - The data URL of the image
 * @param page - A Playwright page to use for measurement
 * @returns Promise with width and height of the image
 */
async function getImageDimensions(dataURL: string, page: Page): Promise<{ width: number; height: number }> {
    const measurePage = await page.context().newPage();
    
    try {
        await measurePage.setContent(`
            <!DOCTYPE html>
            <html>
            <head><title>Measure</title></head>
            <body>
                <img id="measure-img" src="${dataURL}">
            </body>
            </html>
        `);
        
        await measurePage.waitForLoadState('networkidle');
        
        const dimensions = await measurePage.evaluate(() => {
            const img = globalThis.document.getElementById('measure-img') as HTMLImageElement | null;
            return {
                width: img?.naturalWidth || 800,
                height: img?.naturalHeight || 600
            };
        });
        
        return dimensions;
    } finally {
        await measurePage.close();
    }
}

/**
 * Generates the HTML content for the browser window mockup.
 * 
 * @param url - The URL to display in the address bar
 * @param dataURL - The data URL of the screenshot to embed
 * @param dimensions - The dimensions of the original screenshot to preserve
 * @returns The complete HTML string for the mockup
 */
function MountBrowserMockup(url: string, dataURL: string, dimensions: { width: number; height: number }): string {
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
            background: #f0f0f000;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div aria-label="Browser Window" style="border: 1px solid #ddd; border-radius: 8px; margin: 16px; width: ${dimensions.width + 2}px; font-family: Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
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
                style="width: ${dimensions.width}px; height: ${dimensions.height}px; display: block; border-radius: 0 0 8px 8px;"
                src="${dataURL}" 
            >
        </div>
    </div>
</body>
</html>`;
}