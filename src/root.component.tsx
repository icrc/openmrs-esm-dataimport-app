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
import GenerateTemplate from './generate-template.component';
import ImportData from './import-data.component';
import type { Form } from './types';
import styles from './root.scss';

const Root: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const forms: Form[] = [
    { uuid: '1', name: 'HIV Initial Visit', encounterType: 'HIV Initial', version: '1.0' },
    { uuid: '2', name: 'TB Screening', encounterType: 'TB Screening', version: '1.2' },
    { uuid: '3', name: 'Pregnancy Follow-up', encounterType: 'Pregnancy', version: '2.1' },
    { uuid: '4', name: 'Immunization', encounterType: 'Immunization', version: '1.5' }
  ];

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
                <GenerateTemplate forms={forms} />
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
