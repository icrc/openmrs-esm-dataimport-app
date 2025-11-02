import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WorkspaceContainer, UserHasAccess } from '@openmrs/esm-framework';
import GenerateTemplate from './generate-template/generate-template.component';
import ImportData from './import-data/import-data.component';
import LeftPanel from './left-panel/left-panel-component';
import Home from './home.component';
import styles from './root.scss';
import { PRIVILEGE_MANAGE_DATA_IMPORT } from './constants';

const Root: React.FC = () => {
  const dataImportBasename = window.getOpenmrsSpaBase() + 'data-import';

  // The left navigation is handled by the LeftPanel component using ExtensionSlot

  return (
    <UserHasAccess privilege={PRIVILEGE_MANAGE_DATA_IMPORT}>
      <BrowserRouter basename={dataImportBasename}>
        <LeftPanel />
        <main className={styles.containerroot}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate-template" element={<GenerateTemplate />} />
            <Route path="/excel-import" element={<ImportData />} />
          </Routes>
        </main>
        <WorkspaceContainer contextKey="data-import" />
      </BrowserRouter>
    </UserHasAccess>
  );
};

export default Root;
