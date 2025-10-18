import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from './header/header.component';
import styles from './home.scss';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <Header title={t('pageTitle', 'Excel Templates export & Import')} />
    </section>
  );
};

export default Home;
