import type { Page, Locator } from '@playwright/test';

export class RootPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly generateTemplateTab: Locator;
  readonly importDataTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /offline data: excel templates & import/i });
    this.pageDescription = page.getByText(/generate excel templates for offline data collection/i);
    this.generateTemplateTab = page.getByRole('tab', { name: /generate template/i });
    this.importDataTab = page.getByRole('tab', { name: /import data/i });
  }

  async goto() {
    await this.page.goto('/openmrs/spa/root');
    await this.pageTitle.waitFor();
  }

  async waitForPageLoad() {
    await this.pageTitle.waitFor();
    await this.pageDescription.waitFor();
    await this.generateTemplateTab.waitFor();
    await this.importDataTab.waitFor();
  }
}
