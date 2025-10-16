import type { Page, Locator } from '@playwright/test';

export class RootPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly generateTemplateTab: Locator;
  readonly importDataTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /Excel Templates export & Import/i });
    this.pageDescription = page.getByText(/Generate Excel templates for offline data collection and import completed forms./i);
    this.generateTemplateTab = page.getByRole('tab', { name: /Generate Excel Template/i });
    this.importDataTab = page.getByRole('tab', { name: /Import Excel File/i });
  }

  async goto() {
    await this.page.goto('/openmrs/spa/data-import');
    await this.pageTitle.waitFor();
  }

  async waitForPageLoad() {
    await this.pageTitle.waitFor();
    await this.pageDescription.waitFor();
    await this.generateTemplateTab.waitFor();
    await this.importDataTab.waitFor();
  }
}
