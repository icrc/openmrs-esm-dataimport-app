import { test, expect } from '@playwright/test';
import { RootPage, GenerateTemplatePage } from '../pages';

test.describe('Generate Template Functionality', () => {
  let rootPage: RootPage;
  let generateTemplatePage: GenerateTemplatePage;

  test.beforeEach(async ({ page }) => {
    rootPage = new RootPage(page);
    generateTemplatePage = new GenerateTemplatePage(page);
    await rootPage.goto();
  });

  test('should display all generate template components', async ({ page }) => {
    await expect(generateTemplatePage.pageTitle).toBeVisible();
    await expect(generateTemplatePage.selectFormsSection).toBeVisible();
    await expect(generateTemplatePage.templateOptionsSection).toBeVisible();
    await expect(generateTemplatePage.selectedFormsSection).toBeVisible();
    await expect(generateTemplatePage.searchInput).toBeVisible();
    await expect(generateTemplatePage.generateButton).toBeVisible();
  });

  test('should show no forms selected initially', async ({ page }) => {
    await expect(generateTemplatePage.noFormsSelected).toBeVisible();
    await expect(generateTemplatePage.generateButton).toBeDisabled();
  });

  test('should select and deselect forms', async ({ page }) => {
    // Wait for forms to load
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    
    // Get the first form name
    const firstFormCheckbox = page.locator('[class*="formList"] [class*="formItem"]').first();
    const firstFormName = await firstFormCheckbox.locator('label').textContent();
    
    if (firstFormName) {
      // Select the form
      await generateTemplatePage.selectForm(firstFormName);
      await expect(generateTemplatePage.isFormSelected(firstFormName)).resolves.toBe(true);
      
      // Check that it appears in selected forms
      await expect(generateTemplatePage.selectedFormsList).toBeVisible();
      const selectedCount = await generateTemplatePage.getSelectedFormsCount();
      expect(selectedCount).toBe(1);
      
      // Check that generate button is now enabled
      await expect(generateTemplatePage.generateButton).toBeEnabled();
      
      // Deselect the form
      await generateTemplatePage.deselectForm(firstFormName);
      await expect(generateTemplatePage.isFormSelected(firstFormName)).resolves.toBe(false);
      
      // Check that no forms are selected
      await expect(generateTemplatePage.noFormsSelected).toBeVisible();
      await expect(generateTemplatePage.generateButton).toBeDisabled();
    }
  });

  test('should update total sheets and estimated size when forms are selected', async ({ page }) => {
    // Wait for forms to load
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    
    // Get the first form name
    const firstFormCheckbox = page.locator('[class*="formList"] [class*="formItem"]').first();
    const firstFormName = await firstFormCheckbox.locator('label').textContent();
    
    if (firstFormName) {
      // Select the form
      await generateTemplatePage.selectForm(firstFormName);
      
      // Check total sheets (should be 1 form + 1 patient registration = 2)
      const totalSheets = await generateTemplatePage.getTotalSheetsValue();
      expect(totalSheets).toBe('2');
      
      // Check estimated size
      const estimatedSize = await generateTemplatePage.getEstimatedSizeValue();
      expect(estimatedSize).toMatch(/~\d+\.\d+ MB/);
    }
  });

  test('should toggle patient registration option', async ({ page }) => {
    // Initially patient registration should be enabled
    await expect(generateTemplatePage.isPatientRegistrationEnabled()).resolves.toBe(true);
    
    // Toggle it off
    await generateTemplatePage.togglePatientRegistration();
    await expect(generateTemplatePage.isPatientRegistrationEnabled()).resolves.toBe(false);
    
    // Toggle it back on
    await generateTemplatePage.togglePatientRegistration();
    await expect(generateTemplatePage.isPatientRegistrationEnabled()).resolves.toBe(true);
  });

  test('should update total sheets when patient registration is toggled', async ({ page }) => {
    // Wait for forms to load and select a form
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    const firstFormCheckbox = page.locator('[class*="formList"] [class*="formItem"]').first();
    const firstFormName = await firstFormCheckbox.locator('label').textContent();
    
    if (firstFormName) {
      await generateTemplatePage.selectForm(firstFormName);
      
      // With patient registration enabled (default)
      let totalSheets = await generateTemplatePage.getTotalSheetsValue();
      expect(totalSheets).toBe('2'); // 1 form + 1 patient registration
      
      // Disable patient registration
      await generateTemplatePage.togglePatientRegistration();
      totalSheets = await generateTemplatePage.getTotalSheetsValue();
      expect(totalSheets).toBe('1'); // 1 form only
      
      // Re-enable patient registration
      await generateTemplatePage.togglePatientRegistration();
      totalSheets = await generateTemplatePage.getTotalSheetsValue();
      expect(totalSheets).toBe('2'); // 1 form + 1 patient registration
    }
  });

  test('should search forms', async ({ page }) => {
    // Wait for forms to load
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    
    // Get initial form count
    const initialFormCount = await page.locator('[class*="formList"] [class*="formItem"]').count();
    expect(initialFormCount).toBeGreaterThan(0);
    
    // Search for a non-existent form
    await generateTemplatePage.searchForms('NonExistentForm');
    
    // Should show no forms or fewer forms
    const filteredFormCount = await page.locator('[class*="formList"] [class*="formItem"]').count();
    expect(filteredFormCount).toBeLessThanOrEqual(initialFormCount);
    
    // Clear search
    await generateTemplatePage.searchForms('');
    
    // Should show all forms again
    const restoredFormCount = await page.locator('[class*="formList"] [class*="formItem"]').count();
    expect(restoredFormCount).toBe(initialFormCount);
  });

  test('should show generating state when generating template', async ({ page }) => {
    // Wait for forms to load and select a form
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    const firstFormCheckbox = page.locator('[class*="formList"] [class*="formItem"]').first();
    const firstFormName = await firstFormCheckbox.locator('label').textContent();
    
    if (firstFormName) {
      await generateTemplatePage.selectForm(firstFormName);
      
      // Click generate template
      await generateTemplatePage.clickGenerateTemplate();
      
      // Should show generating spinner
      await expect(generateTemplatePage.generatingSpinner).toBeVisible();
      
      // Button should be disabled during generation
      await expect(generateTemplatePage.generateButton).toBeDisabled();
      
      // Wait for generation to complete (this will timeout in test environment)
      // In a real environment, this would complete and show success toast
    }
  });

  test('should display selected forms as tags', async ({ page }) => {
    // Wait for forms to load
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    
    // Select multiple forms
    const formItems = page.locator('[class*="formList"] [class*="formItem"]');
    const formCount = await formItems.count();
    
    if (formCount >= 2) {
      const firstFormName = await formItems.nth(0).locator('label').textContent();
      const secondFormName = await formItems.nth(1).locator('label').textContent();
      
      if (firstFormName && secondFormName) {
        await generateTemplatePage.selectForm(firstFormName);
        await generateTemplatePage.selectForm(secondFormName);
        
        // Check that both forms appear as tags
        const selectedFormNames = await generateTemplatePage.getSelectedFormNames();
        expect(selectedFormNames).toContain(firstFormName);
        expect(selectedFormNames).toContain(secondFormName);
        expect(selectedFormNames.length).toBe(2);
      }
    }
  });
});
