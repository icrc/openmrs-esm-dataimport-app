# OpenMRS ESM Data Import

A modern OpenMRS 3.x microfrontend for generating Excel templates and importing offline data collection forms.

## Overview

This module enables healthcare teams to:

- **Generate Excel Templates** for offline data collection in remote areas
- **Import Completed Forms** from Excel files back into OpenMRS

Perfect for outreach programs, mobile clinics, and areas with unreliable internet connectivity.

## Getting Started

### Prerequisites
- OpenMRS 3.x platform
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/openmrs/openmrs-esm-data-import.git
   cd openmrs-esm-data-import
   ```

2. **Install dependencies**
   ```bash
   yarn
   ```

3. **Development server**
   ```bash
   yarn start
   ```

## Usage

### Generating Excel Templates

1. - Choose the OpenMRS forms you want to include
2. - Enable/disable data sheets (Patient Registration)
3. - Click "Generate Template" to create your Excel file

### Importing Data

1. - Select your completed Excel file
2. - Choose import mode and patient matching policy
3. - Run a dry run to preview changes
4. - Execute the import when ready

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.

---
