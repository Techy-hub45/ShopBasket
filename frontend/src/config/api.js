
function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return '';
  return 'http://127.0.0.1:5000';
}
export default{
  server: {
    host: true
  }
}

export const API_BASE = resolveApiBase();
