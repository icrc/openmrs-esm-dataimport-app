import { test, expect } from '@playwright/test';
import { RootPage, GenerateTemplatePage } from '../pages';

test.describe('Navigation and Tab Switching', () => {
  let rootPage: RootPage;
  let generateTemplatePage: GenerateTemplatePage;

  test.beforeEach(async ({ page }) => {
    rootPage = new RootPage(page);
    generateTemplatePage = new GenerateTemplatePage(page);
    await rootPage.goto();
  });

  test('should display Generate Template tab correctly', async ({ page }) => {
    // Initially should be on Generate Template tab
    await expect(rootPage.generateTemplateTab).toHaveAttribute('aria-selected', 'true');
    await expect(rootPage.importDataTab).toHaveAttribute('aria-selected', 'false');
    
    // Should see Generate Template content
    await expect(generateTemplatePage.selectFormsSection).toBeVisible();
    await expect(generateTemplatePage.templateOptionsSection).toBeVisible();
    await expect(generateTemplatePage.selectedFormsSection).toBeVisible();
  });

  test('should maintain form selection state', async ({ page }) => {
    // Select a form in Generate Template tab
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    const firstFormCheckbox = page.locator('[class*="formList"] [class*="formItem"]').first();
    const firstFormName = await firstFormCheckbox.locator('label').textContent();
    
    if (firstFormName) {
      await generateTemplatePage.selectForm(firstFormName);
      
      // Verify form is selected
      await expect(generateTemplatePage.isFormSelected(firstFormName)).resolves.toBe(true);
      await expect(generateTemplatePage.generateButton).toBeEnabled();
      
      // Refresh the page to test state persistence
      await page.reload();
      await rootPage.goto();
      
      // Form should still be selected after page reload
      await expect(generateTemplatePage.isFormSelected(firstFormName)).resolves.toBe(true);
    }
  });

  test('should have correct URL for Generate Template tab', async ({ page }) => {
    // Initially should be on home page
    await expect(page).toHaveURL(/\/openmrs\/spa\/data-import\/?$/);
    
    // Click Generate Template tab
    await rootPage.generateTemplateTab.click();
    await expect(page).toHaveURL(/\/openmrs\/spa\/data-import\/generate-template/);
  });

  test('should show correct page title for Generate Template tab', async ({ page }) => {
    // Generate Template tab
    await rootPage.generateTemplateTab.click();
    await expect(generateTemplatePage.pageTitle).toBeVisible();
    await expect(generateTemplatePage.pageTitle).toHaveText(/Generate Excel Template/);
  });

  test('should handle keyboard navigation on Generate Template tab', async ({ page }) => {
    // Focus on Generate Template tab
    await rootPage.generateTemplateTab.focus();
    await expect(rootPage.generateTemplateTab).toBeFocused();
    
    // Press Enter to activate the tab
    await page.keyboard.press('Enter');
    await expect(rootPage.generateTemplateTab).toHaveAttribute('aria-selected', 'true');
    
    // Verify Generate Template content is visible
    await expect(generateTemplatePage.selectFormsSection).toBeVisible();
  });
});
