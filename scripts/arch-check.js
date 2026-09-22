#!/usr/bin/env node
/**
 * Architectural Contract Verification Script
 * Validates system boundary rules, separation of concerns, and dependency contracts.
 */

import fs from 'fs';
import path from 'path';

let violationCount = 0;

function reportViolation(rule, file, details) {
  console.error(`❌ [ARCH-CONTRACT VIOLATION] [${rule}] in ${file}: ${details}`);
  violationCount++;
}

function scanDir(dir, filter, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDir(fullPath, filter, callback);
      }
    } else if (filter(entry.name)) {
      callback(fullPath);
    }
  }
}

console.log('🔍 Executing Architectural Contract & Boundary Checks...');

// Rule 1: Client code must NEVER import backend-only packages (express, dotenv, etc.)
const FORBIDDEN_CLIENT_IMPORTS = ['express', 'dotenv', 'esbuild', '@google/genai'];
scanDir('src', (f) => f.endsWith('.ts') || f.endsWith('.tsx'), (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const pkg of FORBIDDEN_CLIENT_IMPORTS) {
    const importRegex = new RegExp(`from\\s+['"]${pkg}['"]`, 'g');
    if (importRegex.test(content)) {
      reportViolation('NO_SERVER_IMPORTS_IN_CLIENT', filePath, `Direct import of backend package "${pkg}" is forbidden in client.`);
    }
  }
});

// Rule 2: No hardcoded secrets or environment API keys in repository files
const FORBIDDEN_HARDCODED_SECRETS = [/AIzaSy[A-Za-z0-9_-]{33}/g];
scanDir('src', (f) => f.endsWith('.ts') || f.endsWith('.tsx'), (filePath) => {
  if (filePath.includes('firebase.ts')) return; // firebase.ts imports public web credentials config safely
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const regex of FORBIDDEN_HARDCODED_SECRETS) {
    if (regex.test(content)) {
      reportViolation('NO_HARDCODED_API_KEYS', filePath, 'Potential hardcoded Google API key found. Use environment variables.');
    }
  }
});

// Rule 3: Components should not declare duplicate core domain types inline (must use types.ts)
scanDir('src/components', (f) => f.endsWith('.tsx'), (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('interface Campaign {') && !filePath.includes('types.ts')) {
    reportViolation('DRY_CORE_TYPES', filePath, 'Campaign interface duplicated locally. Import from src/types.ts instead.');
  }
});

// Rule 4: Performance budget & oversized single-file monitor
scanDir('src', (f) => f.endsWith('.ts') || f.endsWith('.tsx'), (filePath) => {
  const stats = fs.statSync(filePath);
  const sizeKb = Math.round(stats.size / 1024);
  const MAX_FILE_KB = 150;
  if (sizeKb > MAX_FILE_KB) {
    reportViolation('PERFORMANCE_BUDGET_FILE_SIZE', filePath, `File size is ${sizeKb}KB, exceeding maximum modular limit of ${MAX_FILE_KB}KB.`);
  }
});

if (violationCount > 0) {
  console.error(`\n❌ Architectural verification failed with ${violationCount} violation(s).`);
  process.exit(1);
} else {
  console.log('✅ All architectural contracts passed successfully!');
}
