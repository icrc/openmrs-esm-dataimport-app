# Form File Upload Feature

## Overview

The OpenMRS Data Import module now supports uploading form definition files (JSON for O3 forms, XML for HFE forms) directly from your computer. This feature is particularly useful for:

- **Testing**: Generate templates for forms that aren't yet deployed to your OpenMRS instance
- **Development**: Work with form definitions stored in version control or local filesystems
- **Batch Processing**: Upload multiple form files at once and combine them with database forms
- **CI/CD Integration**: Automate template generation using form files from your repository

## Features

✅ **Drag-and-Drop Upload** - Simply drag form files into the upload zone
✅ **Multi-File Support** - Upload multiple JSON/XML files in one go
✅ **Auto-Detection** - Automatically identifies O3 JSON vs HFE XML formats
✅ **Mix & Match** - Combine uploaded files with forms from the database
✅ **File Validation** - Validates file types, sizes, and form structure
✅ **Visual Feedback** - Clear indicators for uploaded forms in the UI

## Supported Form Types

| Format | File Extension | Description |
|--------|---------------|-------------|
| **O3 JSON** | `.json` | OpenMRS 3.x form schemas with `pages` array structure |
| **HFE XML** | `.xml` | HTML Form Entry XML with `<htmlform>` root element |

**File Size Limit**: 10 MB per file

## How to Use

### Step 1: Upload Form Files

1. Navigate to **Data Import** → **Generate Template** in your OpenMRS instance
2. Find the "Upload Form Files" section at the top of the page
3. Either:
   - **Drag and drop** your `.json` or `.xml` files into the drop zone, OR
   - Click **browse** to select files from your file picker

![Upload Zone](docs/screenshots/upload-zone.png)

### Step 2: Review Uploaded Files

After uploading, you'll see:
- ✅ Success notification with file count
- 📄 List of uploaded files with detected types
- 🟢 Green tags showing filename and format

The files are temporarily stored on the server until restart.

### Step 3: Select Forms (Optional)

You can combine uploaded files with forms from the database:
- Check forms from the "Select Forms" list on the left
- Both database forms (blue tags) and uploaded files (green tags) appear in "Selected Forms"

### Step 4: Configure Options

- **Include Patient Registration Sheet**: Add a patient data sheet to the template
- **Select Location**: Choose a location for the template
- **File Name**: Customize the output Excel filename

### Step 5: Generate Template

1. Click **Generate Template** button
2. The system combines:
   - Database form UUIDs
   - Uploaded file identifiers (e.g., `file://abc-123`)
3. Excel template downloads automatically with all selected forms

## Example Workflow

### Scenario: Testing a New O3 Form

```bash
# 1. You have a form definition file locally
my-patient-form.json

# 2. Upload it via the UI (drag-and-drop)
✓ Successfully uploaded 1 form file(s)
  - my-patient-form.json (O3_JSON, 15.2 KB)

# 3. Optionally combine with existing forms
☑ Weight/Height Form (from database)
📄 my-patient-form.json (uploaded)

# 4. Generate template
Total sheets: 3
  - Weight/Height Form sheet
  - my-patient-form sheet
  - Patient Registration sheet (if enabled)

# 5. Download and use the Excel template!
```

## API Integration

The frontend communicates with these backend endpoints:

### Upload Endpoint

**POST** `/rest/v1/dataimport/forms/upload`

**Request**: `multipart/form-data` with `files` field

```bash
curl -X POST \
  -H "Authorization: Basic [credentials]" \
  -F "files=@form1.json" \
  -F "files=@form2.xml" \
  http://localhost:8080/openmrs/rest/v1/dataimport/forms/upload
```

**Response**:
```json
{
  "success": true,
  "fileCount": 2,
  "fileIds": [
    "file://abc-123-def",
    "file://xyz-456-ghi"
  ],
  "files": [
    {
      "filename": "form1.json",
      "detectedType": "O3_JSON",
      "size": "15234"
    },
    {
      "filename": "form2.xml",
      "detectedType": "HFE_XML",
      "size": "8192"
    }
  ],
  "message": "Successfully uploaded 2 form file(s)..."
}
```

### Template Generation Endpoint

**POST** `/rest/v1/dataimport/forms/template.xlsx`

**Request**: JSON with form identifiers (mix of UUIDs and file IDs)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "formUuids": [
      "file://abc-123-def",
      "database-form-uuid-789",
      "file://xyz-456-ghi"
    ],
    "options": {
      "includePatient": true,
      "filename": "my_template.xlsx"
    }
  }' \
  http://localhost:8080/openmrs/rest/v1/dataimport/forms/template.xlsx \
  --output template.xlsx
```

## Technical Details

### Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `FormFileUpload` | `src/form-file-upload/form-file-upload.component.tsx` | Main upload UI with drag-drop |
| `useFormFileUpload` | `src/hooks/useFormFileUpload.ts` | API integration hook |
| `GenerateTemplate` | `src/generate-template/generate-template.component.tsx` | Enhanced with file upload |

### State Management

```typescript
// Uploaded files state
const [uploadedFormFiles, setUploadedFormFiles] = useState<UploadedFormFile[]>([]);

// Combined identifiers for template generation
const allFormIdentifiers = [
  ...selectedForms,          // Database UUIDs
  ...uploadedFormFiles.map(f => f.fileId)  // File IDs like "file://..."
];
```

### Form Type Detection

The system auto-detects form types using content inspection:

**O3 JSON Detection**:
```javascript
// Must have "pages" array at root level
{
  "name": "My Form",
  "pages": [...]  // ← Required for O3 detection
}
```

**HFE XML Detection**:
```xml
<!-- Root element must be <htmlform> -->
<htmlform>
  <obs conceptId="5089" labelText="Weight"/>
</htmlform>
```

### File Lifecycle

1. **Upload**: Files stored in `{openmrs.appDataDirectory}/dataimport/uploaded-forms/`
2. **Storage**: In-memory registry tracks metadata
3. **Usage**: File IDs (e.g., `file://abc-123`) used in template generation
4. **Cleanup**: Files deleted on server restart or manual cleanup

## Security

- ✅ **File Type Validation**: Only `.json` and `.xml` accepted
- ✅ **Size Limits**: Maximum 10 MB per file
- ✅ **Content Validation**: Form structure verified before storage
- ✅ **XXE Prevention**: XML parsing includes entity attack protection
- ✅ **Path Sanitization**: Filename sanitization prevents directory traversal
- ✅ **Temporary Storage**: Files auto-deleted on restart (not persistent)

## Troubleshooting

### Issue: "Unable to detect form type"

**Cause**: File doesn't match O3 JSON or HFE XML structure

**Solution**:
- For O3 forms: Ensure JSON has a `pages` array
- For HFE forms: Ensure XML root element is `<htmlform>`

### Issue: "File too large"

**Cause**: File exceeds 10 MB limit

**Solution**: Reduce form size or split into multiple forms

### Issue: "Upload failed"

**Cause**: Network error or server unavailable

**Solution**:
- Check console for error details
- Verify server is running
- Check authentication credentials

### Issue: "Generated template is empty"

**Cause**: Form file structure is invalid

**Solution**:
- Validate JSON/XML syntax
- Ensure form has proper field definitions
- Check server logs for parsing errors

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires modern browser with:
- File API support
- Drag-and-Drop API
- FormData API

## Development

### Running Locally

```bash
# Frontend (O3 microfrontend)
cd openmrs-esm-data-import
yarn install
yarn start

# Backend (OpenMRS module)
cd openmrs-module-dataimport
mvn clean install
# Deploy to OpenMRS instance
```

### Testing

```typescript
// Unit test example
it('should upload form files successfully', async () => {
  const files = [new File(['{}'], 'test.json', { type: 'application/json' })];
  const result = await uploadFormFiles(files);

  expect(result).toHaveLength(1);
  expect(result[0].detectedType).toBe('O3_JSON');
});
```

### Adding New Form Type Support

To support a new form type:

1. **Backend**: Update `FileBasedFormResolver.detectFormType()` in Java
2. **Frontend**: Update `FormFileUpload` accepted extensions
3. **Add Parser**: Create parser in backend (implement FormParser interface)
4. **Test**: Add integration tests

## Changelog

### Version 1.0.0 (Current)

- ✅ Initial release
- ✅ O3 JSON and HFE XML support
- ✅ Drag-and-drop interface
- ✅ Multi-file batch upload
- ✅ Mix uploaded files with database forms
- ✅ Auto-detection of form types
- ✅ Security: XXE prevention, file validation

## Related Documentation

- [Backend Implementation](../openmrs-module-dataimport/CLAUDE.md#file-based-form-import-feature)
- [API Documentation](API.md)
- [Form Schema Specification](https://openmrs.atlassian.net/wiki/spaces/docs/pages/...)

## Support

For issues or questions:
- GitHub Issues: https://github.com/openmrs/openmrs-module-dataimport/issues
- OpenMRS Talk: https://talk.openmrs.org/

## License

MPL 2.0 (same as OpenMRS core)
