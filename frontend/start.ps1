# PowerShell startup script for Windows with deprecation warnings suppressed
$env:NODE_OPTIONS = '--no-deprecation'
npm start
