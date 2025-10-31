import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRightIcon, UserHasAccess } from '@openmrs/esm-framework';
import { PRIVILEGE_MANAGE_DATA_IMPORT } from './constants';
import styles from './admin-data-import-card-link.scss';

const DataImportCardLink: React.FC = () => {
  const { t } = useTranslation();
  return (
    <UserHasAccess privilege={PRIVILEGE_MANAGE_DATA_IMPORT}>
      <Layer>
        <a className={styles.cardLink} href={`${window.spaBase}/data-import`} target="_blank" rel="norefferer">
          <ClickableTile>
            <div>
              <div className="heading">{t('manageDataImport', 'Manage Data Import')}</div>
              <div className="content">{t('openDataImport', 'Data Import')}</div>
            </div>
            <div className="iconWrapper">
              <ArrowRightIcon size={16} />
            </div>
          </ClickableTile>
        </a>
      </Layer>
    </UserHasAccess>
  );
};

export default DataImportCardLink;
