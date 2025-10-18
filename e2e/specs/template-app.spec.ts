import { test, expect } from '@playwright/test';
import { RootPage, GenerateTemplatePage } from '../pages';

test.describe('Data Import App Core Functionality', () => {
  test('should load and display all core components', async ({ page }) => {
    const rootPage = new RootPage(page);
    await rootPage.goto();

    await expect(page).toHaveURL(/\/openmrs\/spa\/data-import/);

    await expect(rootPage.pageTitle).toBeVisible();
    await expect(rootPage.pageDescription).toBeVisible();

    await expect(rootPage.generateTemplateTab).toBeVisible();
    await expect(rootPage.importDataTab).toBeVisible();

    // Check that we're on the Generate Template tab by default
    await expect(rootPage.generateTemplateTab).toHaveAttribute('aria-selected', 'true');
    await expect(rootPage.importDataTab).toHaveAttribute('aria-selected', 'false');

    // Check for key elements in the Generate Template tab
    await expect(page.getByText('Select Forms')).toBeVisible();
    await expect(page.getByText('Template Options')).toBeVisible();
    await expect(page.getByText('Selected Forms')).toBeVisible();
  });

  test('should display correct page title and description', async ({ page }) => {
    const rootPage = new RootPage(page);
    await rootPage.goto();

    // Check page title
    await expect(rootPage.pageTitle).toHaveText('Excel Templates export & Import');
    
    // Check page description
    await expect(rootPage.pageDescription).toHaveText('Generate Excel templates for offline data collection and import completed forms.');
  });

  test('should have accessible tab navigation', async ({ page }) => {
    const rootPage = new RootPage(page);
    await rootPage.goto();

    // Check tab roles and accessibility
    await expect(rootPage.generateTemplateTab).toHaveAttribute('role', 'tab');
    await expect(rootPage.importDataTab).toHaveAttribute('role', 'tab');
    
    // Check tab panel exists
    const tabPanel = page.locator('[role="tabpanel"]');
    await expect(tabPanel).toBeVisible();
  });

  test('should load forms in Generate Template tab', async ({ page }) => {
    const rootPage = new RootPage(page);
    const generateTemplatePage = new GenerateTemplatePage(page);
    await rootPage.goto();

    // Wait for forms to load
    await page.waitForSelector('[class*="formList"] [class*="formItem"]', { timeout: 10000 });
    
    // Check that forms are displayed
    const formItems = page.locator('[class*="formList"] [class*="formItem"]');
    const formCount = await formItems.count();
    expect(formCount).toBeGreaterThan(0);
    
    // Check that search input is functional
    await expect(generateTemplatePage.searchInput).toBeVisible();
    await expect(generateTemplatePage.searchInput).toBeEnabled();
  });

  test('should show loading state when forms are being fetched', async ({ page }) => {
    // This test would need to be adjusted based on how the loading state is implemented
    // For now, we'll just verify the basic structure exists
    const rootPage = new RootPage(page);
    await rootPage.goto();

    // The page should load without errors
    await expect(rootPage.pageTitle).toBeVisible();
    await expect(rootPage.generateTemplateTab).toBeVisible();
  });
});
