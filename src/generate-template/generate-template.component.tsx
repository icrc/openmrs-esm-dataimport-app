import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Grid,
  Column,
  Tile,
  Checkbox,
  Tag,
  Search,
  InlineLoading,
  Layer,
  ComboBox,
  TextInput,
  MultiSelect,
  Link,
} from '@carbon/react';
import type { TemplateOptions } from '../types';
import { useGetAllForms } from '../hooks/useGetAllForms';
import { useGenerateTemplate } from '../hooks/useGenerateTemplate';
import { useGetAllLocations } from '../hooks/useGetAllLocations';
import { showSnackbar, showNotification } from '@openmrs/esm-framework';
import Header from '../header/header.component';
import EmptyDataIllustration from '../empty-data-illustration/empty-data-illustration.component';
import { FormFileUpload } from '../form-file-upload/form-file-upload.component';
import type { UploadedFormFile } from '../hooks/useFormFileUpload';
import styles from './generate-template.scss';

const GenerateTemplate: React.FC = () => {
  const { forms, isLoading, error } = useGetAllForms();
  const { generate, isGenerating: isGeneratingFile } = useGenerateTemplate();
  const { t } = useTranslation();
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [uploadedFormFiles, setUploadedFormFiles] = useState<UploadedFormFile[]>([]);
  const [templateOptions, setTemplateOptions] = useState<TemplateOptions>({ includePatientRegistration: true });
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationUuids, setSelectedLocationUuids] = useState<string[]>([]);
  const { locations, isLoading: isLoadingLocations, error: locationsError } = useGetAllLocations();
  const locationItems = useMemo(
    () => (locations || []).map((l) => ({ id: l.uuid, uuid: l.uuid, label: l.display || l.name, name: l.name })),
    [locations],
  );

  const filteredForms = useMemo(() => {
    if (!searchTerm.trim()) return forms || [];
    return (forms || []).filter((form) => form.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [forms, searchTerm]);

  const handleFormSelection = (formUuid: string, checked: boolean) => {
    if (checked) {
      setSelectedForms([...selectedForms, formUuid]);
    } else {
      setSelectedForms(selectedForms.filter((uuid) => uuid !== formUuid));
    }
  };

  const handleRemoveForm = (formUuid: string) => {
    setSelectedForms(selectedForms.filter((uuid) => uuid !== formUuid));
  };

  const handleFilesUploaded = useCallback((files: UploadedFormFile[]) => {
    setUploadedFormFiles(files);
  }, []);

  const calculateLocationCharCount = useMemo(() => {
    if (selectedLocationUuids.length === 0) return 0;
    return selectedLocationUuids.reduce((total, uuid) => {
      const location = locationItems.find((l) => l.uuid === uuid);
      return total + (location?.name?.length || 0) + 1; // +1 for separator
    }, 0);
  }, [selectedLocationUuids, locationItems]);

  const handleGenerateTemplate = async () => {
    try {
      setIsGenerating(true);

      // Combine database form UUIDs and uploaded file IDs
      const allFormIdentifiers = [...selectedForms, ...uploadedFormFiles.map((f) => f.fileId)];

      await generate(allFormIdentifiers, {
        includePatientRegistration: templateOptions.includePatientRegistration,
        locationUuid: templateOptions.locationUuid,
        locationUuids: selectedLocationUuids.length > 0 ? selectedLocationUuids : undefined,
        restrictToAllowedLocations: templateOptions.restrictToAllowedLocations,
        filename: templateOptions.filename,
        autoCloseVisits: templateOptions.autoCloseVisits,
      });
      showSnackbar({
        title: t('templateAdded', 'Template Generated Successfully'),
        subtitle: t('templateGenerated', 'Excel Template generated successfully'),
        kind: 'success',
      });
      setSelectedForms([]);
      setUploadedFormFiles([]);
      setSelectedLocationUuids([]);
      setTemplateOptions({ includePatientRegistration: true });
    } catch (e) {
      showSnackbar({
        title: t('failedToGenerateTemplate', 'Failed to generate template'),
        subtitle: (e as Error)?.message || 'Unknown error',
        kind: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotalSheets = () => {
    let total = selectedForms.length + uploadedFormFiles.length;
    if (templateOptions.includePatientRegistration) total += 1;
    return total;
  };

  if (isLoading) {
    return (
      <div className={styles.generateTemplate}>
        <Grid className={styles.grid}>
          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.sectionTile}>
              <InlineLoading description={t('loadingForms', 'Loading forms...')} />
            </Tile>
          </Column>
        </Grid>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.generateTemplate}>
        <Grid className={styles.grid}>
          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.sectionTile}>
              <p>{t('errorLoadingForms', 'Error loading forms. Please try again.')}</p>
            </Tile>
          </Column>
        </Grid>
      </div>
    );
  }

  return (
    <div className={styles.generateTemplate}>
      <div className="pageHeader">
        <Header title={t('generateExcelTemplate', 'Generate Excel Template')} />
      </div>
      <div className="mainContent">
        <Grid className="componentGrid">
          {/* Form File Upload Section - Full Width */}
          <Column lg={16} md={8} sm={4}>
            <FormFileUpload onFilesUploaded={handleFilesUploaded} disabled={isGenerating} />
          </Column>

          <Column lg={5} md={4} sm={4}>
            <Tile className={styles.sectionTile}>
              <h3 className={styles.sectionTitle}>{t('selectForms', 'Select Forms')}</h3>
              {!forms || forms.length === 0 ? (
                <Layer>
                  <Tile className={styles.emptyStateTile} data-openmrs-role="Forms Empty tile">
                    <div className={styles.illo}>
                      <EmptyDataIllustration />
                    </div>
                    <p className={styles.content}>{t('noFormsInList', 'There are no forms available in the system')}</p>
                    <p className={styles.subContent}>
                      {t('contactAdmin', 'Contact your system administrator to add forms or check your permissions')}
                    </p>
                  </Tile>
                </Layer>
              ) : (
                <>
                  <Search
                    labelText={t('searchForms', 'Search forms')}
                    placeholder={t('searchForms', 'Search forms...')}
                    className={styles.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className={styles.formList}>
                    {filteredForms.map((form) => (
                      <div
                        key={form.uuid}
                        className={`${styles.formItem} ${selectedForms.includes(form.uuid) ? styles.formItemSelected : ''}`}
                        onClick={() => handleFormSelection(form.uuid, !selectedForms.includes(form.uuid))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleFormSelection(form.uuid, !selectedForms.includes(form.uuid));
                          }
                        }}
                      >
                        <Checkbox
                          id={form.uuid}
                          labelText={form.name}
                          checked={selectedForms.includes(form.uuid)}
                          onChange={() => {}}
                          className={styles.formCheckbox}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Tile>
          </Column>

          <Column lg={6} md={4} sm={4}>
            <Tile className={styles.sectionTile}>
              <h3 className={styles.sectionTitle}>{t('templateOptions', 'Template Options')}</h3>

              <div className={styles.optionGroup}>
                <h4>{t('includeDataSheets', 'Include data sheets:')}</h4>
                <Checkbox
                  id="includePatientRegistration"
                  labelText={t('includePatientRegistration', 'Include Patient Registration Sheet')}
                  checked={templateOptions.includePatientRegistration}
                  onChange={(event, { checked }) =>
                    setTemplateOptions({ ...templateOptions, includePatientRegistration: checked })
                  }
                />
                <Checkbox
                  id="autoCloseVisits"
                  labelText={t('autoCloseVisits', 'Auto-close visits after encounter creation')}
                  checked={templateOptions.autoCloseVisits || false}
                  onChange={(event, { checked }) =>
                    setTemplateOptions({ ...templateOptions, autoCloseVisits: checked })
                  }
                />
              </div>

              <div className={styles.optionGroup}>
                <h4>{t('defaultLocation', 'Default location')}</h4>
                {isLoadingLocations ? (
                  <InlineLoading description={t('loadingLocations', 'Loading locations...')} />
                ) : locationsError ? (
                  <p>{t('errorLoadingLocations', 'Error loading locations')}</p>
                ) : (
                  <>
                    <ComboBox
                      id="location-selector"
                      titleText={t('location', 'Location')}
                      placeholder={t('searchLocations', 'Search locations')}
                      items={locationItems}
                      itemToString={(item) => (item ? (item as { label?: string }).label || '' : '')}
                      selectedItem={locationItems.find((l) => l.uuid === templateOptions.locationUuid) || null}
                      onChange={({ selectedItem }) => {
                        const selected = selectedItem as { uuid?: string } | null;
                        setTemplateOptions({ ...templateOptions, locationUuid: selected?.uuid });
                      }}
                      shouldFilterItem={(data) => {
                        const text = ((data?.item as { label?: string })?.label || '').toLowerCase();
                        return text.includes((data?.inputValue || '').toLowerCase());
                      }}
                    />
                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                      {t('defaultLocationHint', 'Used when encounterLocation cell is empty')}
                    </p>
                  </>
                )}
              </div>

              <div className={styles.optionGroup}>
                <h4>{t('allowedLocations', 'Allowed locations')}</h4>
                {isLoadingLocations ? (
                  <InlineLoading description={t('loadingLocations', 'Loading locations...')} />
                ) : locationsError ? (
                  <p>{t('errorLoadingLocations', 'Error loading locations')}</p>
                ) : (
                  <>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        onClick={() => setSelectedLocationUuids(locationItems.map((l) => l.uuid))}
                        style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        {t('selectAll', 'Select all')}
                      </Link>
                      <span>|</span>
                      <Link
                        onClick={() => setSelectedLocationUuids([])}
                        style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        {t('deselectAll', 'Deselect all')}
                      </Link>
                      <span
                        style={{
                          marginLeft: '1rem',
                          fontSize: '0.875rem',
                          color:
                            calculateLocationCharCount > 30000
                              ? '#da1e28'
                              : calculateLocationCharCount > 25000
                                ? '#f1c21b'
                                : '#666',
                        }}
                      >
                        {selectedLocationUuids.length === 0
                          ? t('allLocationsIncluded', '(all locations will be included)')
                          : calculateLocationCharCount > 30000
                            ? t(
                                'locationLimitExceeded',
                                `${selectedLocationUuids.length} locations selected (~${calculateLocationCharCount} chars - exceeds Excel limit!)`,
                              )
                            : calculateLocationCharCount > 25000
                              ? t(
                                  'locationLimitWarning',
                                  `${selectedLocationUuids.length} locations selected (~${calculateLocationCharCount} chars - approaching limit)`,
                                )
                              : t('locationsSelected', `${selectedLocationUuids.length} locations selected`)}
                      </span>
                    </div>
                    <MultiSelect
                      id="allowed-locations-selector"
                      titleText={t('locations', 'Locations')}
                      label={t('selectLocations', 'Select locations')}
                      items={locationItems}
                      itemToString={(item) => (item ? item.label : '')}
                      selectedItems={locationItems.filter((l) => selectedLocationUuids.includes(l.uuid))}
                      onChange={({ selectedItems }) => {
                        setSelectedLocationUuids(selectedItems.map((item) => item.uuid));
                      }}
                    />
                    <Checkbox
                      id="restrictToAllowedLocations"
                      labelText={t(
                        'restrictToAllowedLocations',
                        'Restrict to allowed locations (reject invalid locations during import)',
                      )}
                      checked={templateOptions.restrictToAllowedLocations || false}
                      onChange={(event, { checked }) =>
                        setTemplateOptions({ ...templateOptions, restrictToAllowedLocations: checked })
                      }
                      style={{ marginTop: '1rem' }}
                    />
                  </>
                )}
              </div>

              <div className={styles.optionGroup}>
                <h4>{t('filename', 'File name')}</h4>
                <TextInput
                  id="template-filename"
                  labelText={t('filenameLabel', 'File name')}
                  placeholder={t('enterFilename', 'Enter file name (optional)')}
                  value={templateOptions.filename || ''}
                  onChange={(event) => setTemplateOptions({ ...templateOptions, filename: event.target.value })}
                  helperText={t('filenameHelper', 'Default is form_template.xlsx')}
                />
              </div>
            </Tile>
          </Column>

          <Column lg={5} md={4} sm={4}>
            <Tile className={styles.sectionTile}>
              <h3 className={styles.sectionTitle}>{t('selectedForms', 'Selected Forms')}</h3>
              {selectedForms.length === 0 && uploadedFormFiles.length === 0 ? (
                <p className={styles.noSelection}>{t('noFormsSelected', 'No forms selected')}</p>
              ) : (
                <>
                  <div className={styles.selectedFormsList}>
                    {/* Database forms */}
                    {selectedForms.map((uuid) => {
                      const form = forms.find((f) => f.uuid === uuid);
                      return form ? (
                        <Tag key={uuid} type="blue" size="sm" filter onClose={() => handleRemoveForm(uuid)}>
                          {form.name}
                        </Tag>
                      ) : null;
                    })}

                    {/* Uploaded file forms */}
                    {uploadedFormFiles.map((file) => (
                      <Tag key={file.fileId} type="green" size="sm" title={`${file.detectedType}: ${file.filename}`}>
                        📄 {file.filename}
                      </Tag>
                    ))}
                  </div>
                  <div className={styles.summary}>
                    <p>
                      {t('totalSheets', 'Total sheets')}: {calculateTotalSheets()}
                    </p>
                    {uploadedFormFiles.length > 0 && (
                      <p className={styles.uploadedCount}>
                        ({uploadedFormFiles.length} uploaded file{uploadedFormFiles.length > 1 ? 's' : ''})
                      </p>
                    )}
                  </div>
                </>
              )}

              <Button
                className={styles.generateButton}
                disabled={(selectedForms.length === 0 && uploadedFormFiles.length === 0) || isGenerating}
                onClick={handleGenerateTemplate}
              >
                {isGenerating || isGeneratingFile ? (
                  <InlineLoading description={t('generating', 'Generating...')} />
                ) : (
                  t('generateTemplate', 'Generate Template')
                )}
              </Button>
            </Tile>
          </Column>
        </Grid>
      </div>
    </div>
  );
};

export default GenerateTemplate;
