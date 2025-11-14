# OpenMRS ESM Data Import

A modern OpenMRS 3.x microfrontend for generating Excel templates and importing offline data collection forms.

## Overview

This module enables healthcare teams to:

- **Generate Excel Templates** from both O3 forms (JSON schema) and OpenMRS 2.x HTML Form Entry (HFE) forms for offline data collection in remote areas
- **Import Completed Forms** from Excel files back into OpenMRS

Perfect for outreach programs, mobile clinics, and areas with unreliable internet connectivity.

## Supported Form Types

The module automatically detects and supports both:
- **O3 Forms** - Modern JSON schema-based forms (OpenMRS 3.x)
- **HTML Form Entry (HFE)** - XML-based forms (OpenMRS 2.x)

Simply select any form from your system, and the backend will auto-detect the form type and generate the appropriate Excel template.

## Getting Started

### Prerequisites
- OpenMRS 3.x platform
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/icrc/openmrs-esm-dataimport-app.git
   cd openmrs-esm-dataimport-app
   ```

2. **Install dependencies**
   ```bash
   yarn
   ```

3. **Development server**
   ```bash
   yarn start
   ```
