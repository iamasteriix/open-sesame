const requiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}


export const env = {
  PORT: parseInt(requiredEnvVar('PORT')),
  ENDPOINT: requiredEnvVar('ENDPOINT'),
  NODE_ENV: requiredEnvVar('NODE_ENV'),
} as const;