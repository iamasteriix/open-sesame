const requiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}


export const env = {
  PORT: parseInt(requiredEnvVar('PORT')),
  ENDPOINT: requiredEnvVar('ENDPOINT'),
  NODE_ENV: requiredEnvVar('NODE_ENV'),

  // Postgres
  PG_HOST: requiredEnvVar('PG_HOST'),
  PG_PORT: requiredEnvVar('PG_HOST'),
  PG_DATABASE: requiredEnvVar('PG_DATABASE'),
  PG_USER: requiredEnvVar('PG_USER'),
  PG_PASSWORD: requiredEnvVar('PG_PASSWORD'),

  // Redis
  REDIS_HOST: requiredEnvVar('REDIS_HOST'),
  REDIS_PORT: requiredEnvVar('REDIS_PORT'),
  REDIS_PASSWORD: requiredEnvVar('REDIS_PASSWORD'),

  // Logging
  LOG_LEVEL: requiredEnvVar('LOG_LEVEL'),
} as const;