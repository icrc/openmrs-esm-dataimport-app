import { test, expect } from '@playwright/test';
import { RootPage } from '../pages';

test('Data import app loads and displays all core components', async ({ page }) => {
  const rootPage = new RootPage(page);
  await rootPage.goto();

  await expect(page).toHaveURL(/\/openmrs\/spa\/root/);

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
