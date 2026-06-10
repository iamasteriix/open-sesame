export const env = {
  PORT: parseInt(process.env.PORT),
  ENDPOINT: process.env.ENDPOINT,
  NODE_ENV: process.env.NODE_ENV,
} as const;