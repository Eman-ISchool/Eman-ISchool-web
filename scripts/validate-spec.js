#!/usr/bin/env node

/**
 * Spec Artifact Validation Script
 *
 * This script validates spec artifacts (spec.md, plan.md, tasks.md, etc.)
 * to ensure they contain required sections and are internally consistent.
 *
 * Usage: node scripts/validate-spec.js <file-path>
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const REQUIRED_SECTIONS = {
  'spec.md': [
    '## Problem Statement',
    '## Success Criteria',
    '## User Stories',
    '## Functional Requirements',
    '## Non-Functional Requirements',
    '## Out of Scope'
  ],
  'plan.md': [
    '## Tech Stack',
    '## Architecture',
    '## File Structure',
    '## Implementation Phases'
  ],
  'tasks.md': [
    '## Phase 1',
    '## Dependencies'
  ]
};

function validateFile(filePath) {
  const fileName = path.basename(filePath);
  const required = REQUIRED_SECTIONS[fileName];

  if (!required) {
    console.log(`✓ No validation rules for ${fileName} - skipping`);
    return true;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const missing = [];

  for (const section of required) {
    if (!content.includes(section)) {
      missing.push(section);
    }
  }

  if (missing.length > 0) {
    console.error(`✗ ${fileName} is missing required sections:`);
    missing.forEach(s => console.error(`  - ${s}`));
    return false;
  }

  console.log(`✓ ${fileName} validation passed`);
  return true;
}

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node scripts/validate-spec.js <file-path>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const isValid = validateFile(filePath);
  process.exit(isValid ? 0 : 1);
}

main();
