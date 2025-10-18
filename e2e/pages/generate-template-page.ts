import type { Page, Locator } from '@playwright/test';

export class GenerateTemplatePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly selectFormsSection: Locator;
  readonly searchInput: Locator;
  readonly formList: Locator;
  readonly templateOptionsSection: Locator;
  readonly patientRegistrationCheckbox: Locator;
  readonly selectedFormsSection: Locator;
  readonly selectedFormsList: Locator;
  readonly noFormsSelected: Locator;
  readonly totalSheets: Locator;
  readonly estimatedSize: Locator;
  readonly generateButton: Locator;
  readonly generatingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /Generate Excel Template/i });
    this.selectFormsSection = page.getByText('Select Forms');
    this.searchInput = page.getByPlaceholder('Search forms...');
    this.formList = page.locator('[class*="formList"]');
    this.templateOptionsSection = page.getByText('Template Options');
    this.patientRegistrationCheckbox = page.getByLabel('Include Patient Registration Sheet');
    this.selectedFormsSection = page.getByText('Selected Forms');
    this.selectedFormsList = page.locator('[class*="selectedFormsList"]');
    this.noFormsSelected = page.getByText('No forms selected');
    this.totalSheets = page.getByText(/Total sheets/);
    this.estimatedSize = page.getByText(/Estimated size/);
    this.generateButton = page.getByRole('button', { name: /Generate Template/i });
    this.generatingSpinner = page.getByText('Generating...');
  }

  async goto() {
    await this.page.goto('/openmrs/spa/data-import/generate-template');
    await this.pageTitle.waitFor();
  }

  async waitForPageLoad() {
    await this.pageTitle.waitFor();
    await this.selectFormsSection.waitFor();
    await this.templateOptionsSection.waitFor();
    await this.selectedFormsSection.waitFor();
  }

  async searchForms(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
  }

  async selectForm(formName: string) {
    const formItem = this.page.getByRole('checkbox', { name: formName });
    await formItem.click();
  }

  async deselectForm(formName: string) {
    const formItem = this.page.getByRole('checkbox', { name: formName });
    await formItem.click();
  }

  async isFormSelected(formName: string): Promise<boolean> {
    const formItem = this.page.getByRole('checkbox', { name: formName });
    return await formItem.isChecked();
  }

  async getSelectedFormsCount(): Promise<number> {
    const selectedTags = this.selectedFormsList.locator('[class*="cds--tag"]');
    return await selectedTags.count();
  }

  async getSelectedFormNames(): Promise<string[]> {
    const selectedTags = this.selectedFormsList.locator('[class*="cds--tag"]');
    const count = await selectedTags.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await selectedTags.nth(i).textContent();
      if (text) names.push(text);
    }
    return names;
  }

  async togglePatientRegistration() {
    await this.patientRegistrationCheckbox.click();
  }

  async isPatientRegistrationEnabled(): Promise<boolean> {
    return await this.patientRegistrationCheckbox.isChecked();
  }

  async clickGenerateTemplate() {
    await this.generateButton.click();
  }

  async isGenerateButtonDisabled(): Promise<boolean> {
    return await this.generateButton.isDisabled();
  }

  async waitForGenerationToComplete() {
    await this.generatingSpinner.waitFor({ state: 'hidden' });
  }

  async getTotalSheetsValue(): Promise<string> {
    const text = await this.totalSheets.textContent();
    return text?.split(':')[1]?.trim() || '';
  }

  async getEstimatedSizeValue(): Promise<string> {
    const text = await this.estimatedSize.textContent();
    return text?.split(':')[1]?.trim() || '';
  }
}
