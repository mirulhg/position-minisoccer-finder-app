export { useAuthSession } from './hooks/useAuthSession';
export { LoginForm } from './components/LoginForm';
export { deriveDisplayName } from './lib/derive-display-name';
export {
  migrateLocalProfileToSupabase,
  type MigrateLocalProfileInput,
  type MigrateLocalProfileResult,
} from './lib/migrate-local-profile';
