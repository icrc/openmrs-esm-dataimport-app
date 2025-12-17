import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from './header/header.component';
import AuditLog from './audit-log/audit-log.component';
import styles from './home.scss';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <section className={styles.section}>
        <Header title={t('pageTitle', 'Excel Templates export & Import')} />
      </section>
      <AuditLog />
    </div>
  );
};

export default Home;
