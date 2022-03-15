type AuthConfig = {
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: number; // in seconds
  REFRESH_TOKEN_EXPIRATION: number; // in seconds
  COOKIE_EXPIRATION: number; // in milliseconds
  SALT_ROUNDS: number | string;
};

function parseSaltRounds(salt: string | undefined, defaultValue: number | string): number | string {
  if (salt === undefined) {
    return defaultValue;
  }
  const value = parseFloat(salt);
  return value || defaultValue;
}

const authConfig: AuthConfig = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string, // fs.readFileSync(path.join(__dirname, './../../../public.key'));
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRATION: (process.env.ACCESS_TOKEN_EXPIRATION || 3600) as number, // 1 hour
  REFRESH_TOKEN_EXPIRATION: (process.env.REFRESH_TOKEN_EXPIRATION || 86400) as number, // 24 hours
  /* for test */
  // ACCESS_TOKEN_EXPIRATION: 60,          // 1 minute
  // REFRESH_TOKEN_EXPIRATION: 120,  // 2 minutes
  COOKIE_EXPIRATION: (process.env.COOKIE_EXPIRATION || 0) as number, // en milliseconds //  8 * 3600000: cookie will be removed after 8 hours
  SALT_ROUNDS: parseSaltRounds(process.env.SALT_ROUNDS, '$2b$10$zjTwStq0X8vcx1JXAHEUMe'),
};

export default authConfig;
