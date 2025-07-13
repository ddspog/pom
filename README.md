# 🧪 Playwright Page Object Model Utilities

This project provides a robust, extensible base for building Page Object Models (POMs) in Playwright tests. Built with Deno and TypeScript, it includes utilities for component-level and page-level POMs, with consistent logging, selector helpers, and common UI actions.

## ✅ Goals
- Reusable component and page objects (e.g. FormPom, ModalPom, etc.)
- Minimal boilerplate for selectors and actions
- Consistent logging for all interactions
- Easy extension for your own custom POMs

## 📦 Installation

This is a Deno package. Import it directly:

```typescript
import { ComponentObjectModel, PageObjectModel, Mockup } from "jsr:@ddspog/pom";
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "@ddspog/pom": "jsr:@ddspog/pom"
  }
}
```

## 🚀 Quick Start

### 1. Create Reusable Component POMs

```typescript
import { ComponentObjectModel } from '@ddspog/pom';
import type { Page, Locator } from '@playwright/test';

export class ButtonComponentPom extends ComponentObjectModel {
  constructor(page: Page) { 
    super(page); 
  }

  get submitButton(): Locator {
    return this.getByRole('button', { name: 'Submit' });
  }

  async clickSubmit() {
    await this.click(this.submitButton);
  }
}
```

### 2. Compose Page POMs with Components

```typescript
import { PageObjectModel } from '@ddspog/pom';
import type { Page } from '@playwright/test';
import { ButtonComponentPom } from './ButtonComponentPom.ts';

export class LoginPagePom extends PageObjectModel<'/login'> {
  public readonly buttonComponent: ButtonComponentPom;

  constructor(page: Page) { 
    super(page, '/login'); 
    this.buttonComponent = new ButtonComponentPom(page);
  }

  async open() {
    await this.goto();
  }
}
```

## 🧪 In a Test File

```typescript
import { test, expect } from '@playwright/test';
import { LoginPagePom } from './poms/LoginPagePom.ts';

test('login flow', async ({ page }) => {
  const loginPage = new LoginPagePom(page);
  
  await loginPage.open();                           // ✅ navigate to /login
  await loginPage.buttonComponent.clickSubmit();   // ✅ use component
  await expect(loginPage.buttonComponent.submitButton).toBeVisible();
});
```

## 🧠 Under the Hood
- All POMs inherit from `ComponentObjectModel` or `PageObjectModel`
- Built with Deno and TypeScript for modern development
- Comprehensive logging with `[POM: ClassName] action` format
- All selector methods are **protected** (use within POM classes)
- All action methods are **protected** (use within POM classes)
- Special `$error` locator for `[aria-invalid="true"]` elements
- Force-click enabled by default for better test reliability

### Key Features:
- **Automatic Logging**: Every action is logged with class name and method details
- **Protected Methods**: Encapsulation encourages proper POM patterns
- **TypeScript Generic URLs**: Strong typing for page URLs (e.g., `PageObjectModel<'/login'>`)
- **Consistent API**: All Playwright selectors and actions wrapped with logging

---

## 📖 API Reference

### `ComponentObjectModel`

Base class for all component-level POMs. Provides Playwright page instance management, selector utilities, logging, and common actions.

**Constructor:**
```typescript
constructor(page: Page)
```

**Built-in Locators:**
- `$error` — Gets elements with `[aria-invalid="true"]` (for form validation errors)

**Protected Selector Utilities:**
- `getByText(text: string | RegExp, options?)` — Find by visible text
- `getByRole(role: AriaRole, options?)` — Find by ARIA role  
- `getByTestId(testId: string | RegExp)` — Find by test ID attribute
- `getByLabel(text: string | RegExp, options?)` — Find by label text
- `getByPlaceholder(text: string | RegExp, options?)` — Find by placeholder text
- `getByAltText(text: string | RegExp, options?)` — Find by alt text
- `locator(selector: string, options?)` — CSS selector with options

**Protected Action Methods:**
- `click(locator: Locator, options?)` — Click with force: true by default
- `fill(locator: Locator, text: string, options?)` — Type text into input
- `hover(locator: Locator, options?)` — Hover over element
- `press(key: string, options?)` — Press keyboard key
- `selectOption(locator: Locator, value: string | string[], options?)` — Select dropdown option
- `waitUntilVisible(locator: Locator, options?)` — Wait for element to be visible
- `waitUntilHidden(locator: Locator, options?)` — Wait for element to be hidden

**Protected Logging:**
- `log(action: string)` — Logs with format `[POM: ClassName] action`

**Example:**
```typescript
export class FormComponentPom extends ComponentObjectModel {
  get emailInput(): Locator {
    return this.getByLabel('Email');
  }

  get submitButton(): Locator {
    return this.getByRole('button', { name: 'Submit' });
  }

  async fillEmail(email: string) {
    await this.fill(this.emailInput, email);
  }

  async submit() {
    await this.click(this.submitButton);
  }

  async waitForValidationError() {
    await this.waitUntilVisible(this.$error);
  }
}
```

---

### `PageObjectModel<TURL extends string>`

Base class for all page-level POMs. Extends `ComponentObjectModel` and adds a `url` property and navigation.

**Constructor:**
```typescript
constructor(page: Page, url: TURL)
```

**Properties:**
- `url: TURL` — The URL for this page object (readonly)

**Navigation:**
- `goto(): Promise<void>` — Navigates to the page's URL

**Inherits all methods from ComponentObjectModel** (selectors, actions, logging)

**Example:**
```typescript
export class HomePagePom extends PageObjectModel<'/home'> {
  public readonly headerComponent: HeaderComponentPom;

  constructor(page: Page) {
    super(page, '/home');
    this.headerComponent = new HeaderComponentPom(page);
  }

  async open() {
    await this.goto(); // Navigates to '/home'
  }

  get welcomeMessage(): Locator {
    return this.getByText('Welcome to our site!');
  }
}
```

---

### `Mockup` Function

Creates enhanced browser screenshots with custom HTML overlays, specifically designed for documentation and presentation purposes.

**Function Signature:**
```typescript
Mockup(options: MockupOptions): Promise<Uint8Array>
```

**Types:**
```typescript
interface MockupOptions {
  page: Page;           // The Playwright page instance
  frame: 'browser';      // Currently only 'browser' is supported
  url: string;          // URL to display in the browser address bar
  
  // Screenshot options (all optional)
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
  clip?: { x: number; y: number; width: number; height: number };
  fullPage?: boolean;   // Take full page screenshot
  mask?: Array<Locator>; // Elements to mask
  maskColor?: string;   // Color of mask overlay
  omitBackground?: boolean; // Remove white background
  quality?: number;     // JPEG quality (0-100)
  scale?: 'css' | 'device'; // Screenshot scale
  style?: string;       // CSS to apply during screenshot
  timeout?: number;     // Screenshot timeout
  type?: 'png' | 'jpeg';  // Screenshot format
}
```

**What it does:**
1. Takes a screenshot of the current page
2. Creates a new page with custom HTML that represents a stylized browser window
3. Embeds the original screenshot as the page content
4. Displays the provided URL in a realistic browser address bar
5. Returns the final mockup screenshot

**Example Usage:**
```typescript
import { test } from '@playwright/test';
import { Mockup } from '@ddspog/pom';

test('create mockup screenshot', async ({ page }) => {
  // Navigate to your page and set up content
  await page.goto('https://example.com');
  
  // Create a browser window mockup
  const mockupScreenshot = await Mockup({
    page,
    type: 'browser',
    url: 'https://example.com',
    fullPage: true
  });
  
  // Save or use the mockup screenshot
  await Deno.writeFile('mockup.png', mockupScreenshot);
});
```

**Using in POM Classes:**
```typescript
class DocumentationPom extends ComponentObjectModel {
  async createPageMockup(displayUrl: string): Promise<Uint8Array> {
    return await Mockup({
      page: this.page,
      type: 'browser',
      url: displayUrl
    });
  }
}
```

**Features:**
- 🎨 Realistic browser window styling with traffic lights (red, yellow, green buttons)
- 🔒 Secure URL indicator with lock icon
- 📱 Responsive design that works with various screenshot sizes
- 🧹 Automatic cleanup (closes temporary pages)
- 💾 Returns Uint8Array for easy file saving or further processing
- ⚡ Fast execution using Playwright's screenshot API

---

## 🛠️ Development & Testing

This project uses Deno for development and includes comprehensive Playwright tests.

### Project Structure
```
src/
├── ComponentObjectModel.ts  # Base component POM class
├── PageObjectModel.ts       # Base page POM class  
└── mod.ts                  # Main exports

examples/
├── ExampleComponentPom.ts  # Example component implementation
├── ExamplePagePom.ts       # Example page implementation
└── mod.ts                  # Example exports

e2e/
├── ComponentObjectModel.spec.ts  # Tests for ComponentObjectModel
└── PageObjectModel.spec.ts       # Tests for PageObjectModel
```

### Running Tests
```bash
# Install dependencies
deno i
deno task test
```

### Extending This Pattern
- **Component Composition**: Instantiate component POMs in your page POM constructor
- **Custom Utilities**: Add your own methods to base classes or individual POMs
- **TypeScript Safety**: Use generic types for strong URL typing
- **Logging**: All interactions are automatically logged for debugging

## 🚫 You No Longer Need To:
- Repeat selector logic in every test
- Write custom logging for every action  
- Manually wire up Playwright's page instance everywhere
- Remember to add logging to POM methods
- Write boilerplate for common UI patterns

## 🎯 Best Practices:

### ✅ Do:
- Use descriptive locator getters: `get emailInput(): Locator`
- Compose POMs in constructors: `this.header = new HeaderPom(page)`
- Use protected methods within POM classes
- Leverage TypeScript generics for URLs: `PageObjectModel<'/login'>`

### ❌ Don't:
- Call protected methods from tests (use public methods instead)
- Create POMs without extending base classes
- Skip the logging (it's automatic!)
- Hardcode selectors in tests

## 🔄 Migration from Legacy Pattern

**Before (Manual Wiring):**
```typescript
export class DeckManagementPagePOM extends BasePOM<{
    deckSelector: DropdownPOM;
    deckControls: DeckControlsPOM;
}> {
    public readonly deckSelector: DropdownPOM;
    public readonly deckControls: DeckControlsPOM;

    constructor(page: Page) {
        const deckSelector = new DropdownPOM(page, 'deck-selector');
        const deckControls = new DeckControlsPOM(page);

        super(page, { deckSelector, deckControls });

        this.deckSelector = deckSelector;
        this.deckControls = deckControls;
    }
}
```

**After (Simple Composition):**
```typescript
export class DeckManagementPagePom extends PageObjectModel<'/deck-management'> {
    public readonly deckSelector: DropdownPom;
    public readonly deckControls: DeckControlsPom;
    
    constructor(page: Page) {
        super(page, '/deck-management');
        this.deckSelector = new DropdownPom(page);
        this.deckControls = new DeckControlsPom(page);
    }
}
```

**Key improvements:**
- ✅ No manual wiring required
- ✅ Automatic logging for all interactions  
- ✅ TypeScript generics for URL safety
- ✅ Protected methods encourage proper encapsulation
- ✅ Built-in common utilities ($error, consistent actions)

---

## 📝 License

This project is available as open source under the terms of the [MIT License](LICENSE).