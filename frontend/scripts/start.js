#!/usr/bin/env node

// This script runs craco start with deprecation warnings suppressed
process.env.NODE_OPTIONS = '--no-deprecation';

// Suppress Node.js deprecation warnings in CLI
const originalEmit = process.emit;
process.emit = function (name, error) {
  if (
    name === 'warning' &&
    error.name === 'DeprecationWarning'
  ) {
    return;
  }
  return originalEmit.apply(process, arguments);
};

// Run craco start
require('cross-spawn')('npm', ['run', 'start:craco'], { stdio: 'inherit' });
