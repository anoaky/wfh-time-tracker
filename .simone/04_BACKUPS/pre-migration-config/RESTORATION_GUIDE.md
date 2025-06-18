# Configuration Backup Restoration Guide

## Overview
This guide provides step-by-step instructions for restoring configuration files from the pre-migration backup created on 2025-06-18.

## Backup Contents
- **Location**: `.simone/04_BACKUPS/pre-migration-config/`
- **Archive**: `config-backup-20250618.tar.gz`
- **Manifest**: `backup-manifest.json`
- **Checksums**: `checksums.txt`

## Restoration Methods

### Method 1: Individual File Restoration
Use this method to restore specific configuration files:

```bash
# Navigate to project root
cd /path/to/wfh-time-tracker

# Restore specific file (example: angular.json)
cp .simone/04_BACKUPS/pre-migration-config/angular/20250618_angular.json angular.json

# Restore package.json and package-lock.json
cp .simone/04_BACKUPS/pre-migration-config/dependencies/20250618_package.json package.json
cp .simone/04_BACKUPS/pre-migration-config/dependencies/20250618_package-lock.json package-lock.json

# After restoring package files, rebuild dependencies
npm install
```

### Method 2: Full Configuration Restoration
Use this method to restore all configuration files at once:

```bash
# Navigate to project root
cd /path/to/wfh-time-tracker

# Extract archive to temporary location for verification
mkdir -p temp-restore
tar -xzf .simone/04_BACKUPS/pre-migration-config/config-backup-20250618.tar.gz -C temp-restore

# Copy files from temporary location to project root
cp temp-restore/angular/20250618_angular.json angular.json
cp temp-restore/angular/20250618_tsconfig.json tsconfig.json
cp temp-restore/angular/20250618_tsconfig.app.json tsconfig.app.json
cp temp-restore/angular/20250618_tsconfig.spec.json tsconfig.spec.json
cp temp-restore/dependencies/20250618_package.json package.json
cp temp-restore/dependencies/20250618_package-lock.json package-lock.json
cp temp-restore/firebase/20250618_firebase.json firebase.json
cp temp-restore/firebase/20250618_.firebaserc .firebaserc
cp temp-restore/tooling/20250618_.editorconfig .editorconfig
cp temp-restore/tooling/20250618_.postcssrc.json .postcssrc.json
cp temp-restore/app-config/20250618_app.config.ts src/app/app.config.ts
cp temp-restore/app-config/20250618_app.routes.ts src/app/app.routes.ts

# Clean up temporary files
rm -rf temp-restore

# Rebuild dependencies
npm install
```

## Verification Steps

### 1. File Integrity Check
Verify that restored files match the original backups:

```bash
# Compare checksums
shasum -a 256 angular.json package.json firebase.json
# Compare against checksums.txt in backup directory
```

### 2. Configuration Validation
Test that restored configurations are valid:

```bash
# Test Angular configuration
ng build --dry-run

# Test TypeScript configuration
npx tsc --noEmit

# Test package.json
npm run build
```

### 3. Application Verification
Ensure the application still functions correctly:

```bash
# Start development server
ng serve

# Run tests
npm test

# Build for production
npm run build
```

## Troubleshooting

### Common Issues

**Issue**: npm install fails after restoring package files
**Solution**: Clear npm cache and try again:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**Issue**: TypeScript compilation errors
**Solution**: Verify TypeScript configuration files were restored correctly:
```bash
cat tsconfig.json
cat tsconfig.app.json
cat tsconfig.spec.json
```

**Issue**: Angular build fails
**Solution**: Check angular.json configuration:
```bash
cat angular.json
ng build --dry-run
```

## Emergency Contacts
If restoration fails, consult:
- Task documentation: `.simone/03_SPRINTS/S01_M01_Migration_Prep/T04_S01_Backup_Configuration.md`
- Project manifest: `.simone/00_PROJECT_MANIFEST.md`
- Migration requirements: `.simone/02_REQUIREMENTS/M01_Angular_V20_Migration/`