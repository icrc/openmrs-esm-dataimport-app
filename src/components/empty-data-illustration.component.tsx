import React from 'react';
import { Document } from '@carbon/react/icons';
import styles from './empty-data-illustration.scss';

const EmptyDataIllustration: React.FC = () => {
  return (
    <div className={styles.illustration}>
      <Document size={64} className={styles.icon} />
    </div>
  );
};

export default EmptyDataIllustration;