function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const API_URL = getEnvVar(
  "EXPO_PUBLIC_API_URL",
  "http://10.0.2.2:3000"
);
export const SOCKET_URL = getEnvVar(
  "EXPO_PUBLIC_SOCKET_URL",
  API_URL
);