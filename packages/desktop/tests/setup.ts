import '@testing-library/jest-dom'

// Mock import.meta.env for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_OPENAI_API_KEY: 'test-api-key',
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  },
  writable: true
})
