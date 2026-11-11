// Backward-compatible entry point. The migration now requires an explicit
// service-role environment and runs in dry-run mode unless --apply is passed.
await import('./scripts/migrate-legacy-listing-images.mjs');
