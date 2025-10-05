import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@carbon/react';
import GenerateTemplate from './generate-template/generate-template.component';
import ImportData from './import-data/import-data.component';
import styles from './root.scss';

const Root: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.container}>
      <Grid className={styles.grid}>
        <Column lg={16} md={8} sm={4}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {t('pageTitle', 'Offline Data: Excel Templates & Import')}
            </h1>
            <p className={styles.subtitle}>
              {t('pageDescription', 'Generate Excel templates for offline data collection and import completed forms.')}
              <a href="#" className={styles.link}> {t('operatorGuide', 'Operator Guide')}</a>
            </p>
          </div>
        </Column>
      </Grid>

      <Grid className={styles.grid}>
        <Column lg={16} md={8} sm={4}>
          <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
            <TabList>
              <Tab>{t('generateTemplate', 'Generate Template')}</Tab>
              <Tab>{t('importData', 'Import Data')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <GenerateTemplate />
              </TabPanel>

              <TabPanel>
                <ImportData />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Grid>

    </div>
  );
};

export default Root;
