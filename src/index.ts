/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel-link.component';

const moduleName = '@icrc/openmrs-esm-dataimport-app';

const options = {
  featureName: 'data-import',
  moduleName,
};

/**
 * This tells the app shell how to obtain translation files: that they
 * are JSON files in the directory `../translations` (which you should
 * see in the directory structure).
 */
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

/**
 * This function performs any setup that should happen at microfrontend
 * load-time (such as defining the config schema) and then returns an
 * object which describes how the React application(s) should be
 * rendered.
 */
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

/**
 * This named export tells the app shell that the default export of `root.component.tsx`
 * should be rendered when the route matches `root`. The full route
 * will be `openmrsSpaBase() + 'root'`, which is usually
 * `/openmrs/spa/root`.
 */
export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const adminDataImportCardLink = getAsyncLifecycle(() => import('./admin-data-import-card-link.component'), options);

// Register navigation items as extensions
export const homeNavItem = getSyncLifecycle(createLeftPanelLink({name: 'data-import', title: 'Overview'}), options);
export const generateTemplateNavItem = getSyncLifecycle(createLeftPanelLink({name: 'generate-template', title: 'Generate Excel Template'}), options);
export const excelImportNavItem = getSyncLifecycle(createLeftPanelLink({name: 'excel-import', title: 'Excel Import'}), options);
