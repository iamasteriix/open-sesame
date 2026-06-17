const requiredEnvVar = (key: string): string => {
  const value = process.env[key];
  console.log({ [key]: value });
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}


export const env = {
  PORT: parseInt(requiredEnvVar('PORT')),
  ENDPOINT: requiredEnvVar('ENDPOINT'),
  NODE_ENV: requiredEnvVar('NODE_ENV'),

  // postgres
  PG_HOST: requiredEnvVar('PG_HOST'),
  PG_PORT: parseInt(requiredEnvVar('PG_PORT')),
  PG_DATABASE: requiredEnvVar('PG_DATABASE'),
  PG_USER: requiredEnvVar('PG_USER'),
  PG_PASSWORD: requiredEnvVar('PG_PASSWORD'),

  // redis
  REDIS_HOST: requiredEnvVar('REDIS_HOST'),
  REDIS_PORT: parseInt(requiredEnvVar('REDIS_PORT')),
  REDIS_PASSWORD: requiredEnvVar('REDIS_PASSWORD'),

  // logging
  LOG_LEVEL: requiredEnvVar('LOG_LEVEL'),

  // auth
  JWT_PRIVATE_KEY_B64: requiredEnvVar('JWT_PRIVATE_KEY_B64'),
  JWT_PUBLIC_KEY_B64: requiredEnvVar('JWT_PUBLIC_KEY_B64'),
} as const;