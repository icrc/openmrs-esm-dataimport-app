import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Grid,
  Column,
  Tile,
  Checkbox,
  Select,
  SelectItem,
  RadioButtonGroup,
  RadioButton,
  Toggle,
  Modal,
  Loading,
  Tag,
  Search,
  InlineLoading
} from '@carbon/react';
import type { Form, TemplateOptions } from './types';
import { LANGUAGES, REPEAT_OPTIONS } from './constants';
import styles from './generate-template.scss';

interface GenerateTemplateProps {
  forms: Form[];
}

const GenerateTemplate: React.FC<GenerateTemplateProps> = ({ forms }) => {
  const { t } = useTranslation();
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [templateOptions, setTemplateOptions] = useState<TemplateOptions>({
    includePatientRegistration: true,
    includeVisitSheet: false,
    includeLocationDetails: false,
    includeInstructions: true,
    language: 'en',
    includeRepeatsInline: false,
    includeCodedDropdowns: true,
    includeReadme: true,
    filenamePattern: '{identifier}_{formnames}_{date}'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormSelection = (formUuid: string, checked: boolean) => {
    if (checked) {
      setSelectedForms([...selectedForms, formUuid]);
    } else {
      setSelectedForms(selectedForms.filter(uuid => uuid !== formUuid));
    }
  };

  const handleGenerateTemplate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const calculateTotalSheets = () => {
    let total = selectedForms.length;
    if (templateOptions.includeInstructions) total += 1;
    if (templateOptions.includePatientRegistration) total += 1;
    if (templateOptions.includeVisitSheet) total += 1;
    if (templateOptions.includeLocationDetails) total += 1;
    return total;
  };

  const calculateEstimatedSize = () => {
    const baseSize = 0.5; // Base size in MB
    const sheets = calculateTotalSheets();
    const sizePerSheet = 0.3;
    return (baseSize + (sheets * sizePerSheet)).toFixed(1);
  };

  return (
    <div className={styles.generateTemplate}>
      <Grid className={styles.grid}>
        <Column lg={5} md={4} sm={4}>
          <Tile className={styles.sectionTile}>
            <h3 className={styles.sectionTitle}>{t('selectForms', 'Select Forms')}</h3>
            <Search
              labelText={t('searchForms', 'Search forms')}
              placeholder={t('searchForms', 'Search forms...')}
              className={styles.search}
            />
            <div className={styles.formList}>
              {forms.map(form => (
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
                    onChange={() => {}} // Handled by the parent div click
                    className={styles.formCheckbox}
                  />
                </div>
              ))}
            </div>
            <Button
              kind="ghost"
              size="sm"
              className={styles.quickSelect}
            >
              {t('selectRecommended', 'Select recommended for outreach')}
            </Button>
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
                onChange={(event, { checked }) => setTemplateOptions({...templateOptions, includePatientRegistration: checked})}
              />
              <Checkbox
                id="includeVisitSheet"
                labelText={t('includeVisitSheet', 'Include Visit Sheet')}
                checked={templateOptions.includeVisitSheet}
                onChange={(event, { checked }) => setTemplateOptions({...templateOptions, includeVisitSheet: checked})}
              />
              <Checkbox
                id="includeLocationDetails"
                labelText={t('includeLocationDetails', 'Include Location Details')}
                checked={templateOptions.includeLocationDetails}
                onChange={(event, { checked }) => setTemplateOptions({...templateOptions, includeLocationDetails: checked})}
              />
              <Checkbox
                id="includeInstructions"
                labelText={t('includeInstructions', 'Add Instructions Sheet')}
                checked={templateOptions.includeInstructions}
                onChange={(event, { checked }) => setTemplateOptions({...templateOptions, includeInstructions: checked})}
              />
            </div>

            <div className={styles.optionGroup}>
              <label htmlFor="language">{t('language', 'Language:')}</label>
              <Select id="language" defaultValue={templateOptions.language}>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value} text={lang.text} />
                ))}
              </Select>
            </div>


            <div className={styles.optionGroup}>
              <Toggle
                id="includeCodedDropdowns"
                labelText={t('includeCodedDropdowns', 'Include coded dropdowns')}
                toggled={templateOptions.includeCodedDropdowns}
                onToggle={(toggled) => setTemplateOptions({...templateOptions, includeCodedDropdowns: toggled})}
              />
            </div>
          </Tile>
        </Column>

        <Column lg={5} md={4} sm={4}>
          <Tile className={styles.sectionTile}>
            <h3 className={styles.sectionTitle}>{t('selectedForms', 'Selected Forms')}</h3>
            {selectedForms.length === 0 ? (
              <p className={styles.noSelection}>{t('noFormsSelected', 'No forms selected')}</p>
            ) : (
              <>
                <div className={styles.selectedFormsList}>
                  {selectedForms.map(uuid => {
                    const form = forms.find(f => f.uuid === uuid);
                    return form ? (
                      <Tag key={uuid} type="blue" size="sm">
                        {form.name}
                      </Tag>
                    ) : null;
                  })}
                </div>
                <div className={styles.summary}>
                  <p>{t('totalSheets', 'Total sheets')}: {calculateTotalSheets()}</p>
                  <p>{t('estimatedSize', 'Estimated size')}: ~{calculateEstimatedSize()} MB</p>
                </div>
              </>
            )}
            
            <Button
              className={styles.generateButton}
              disabled={selectedForms.length === 0 || isGenerating}
              onClick={handleGenerateTemplate}
            >
              {isGenerating ? (
                <InlineLoading description={t('generating', 'Generating...')} />
              ) : (
                t('generateTemplate', 'Generate Template')
              )}
            </Button>
          </Tile>
        </Column>
      </Grid>


      <Modal
        open={isGenerating}
        modalHeading={t('generatingTemplate', 'Generating Template')}
        preventCloseOnClickOutside
        size="sm"
      >
        <Loading description={t('generatingTemplateDescription', 'Creating your Excel template...')} />
      </Modal>
    </div>
  );
};

export default GenerateTemplate;
