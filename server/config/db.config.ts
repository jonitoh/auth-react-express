export type DbConfig = {
  HOST: string;
  PORT: number;
  DB: string;
  URI: string;
};

const dbConfig: DbConfig = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: (process.env.DB_PORT || 27017) as number,
  DB: process.env.DB_NAME || 'auth_db',
  URI: process.env.DB_URI || 'mongodb://localhost:27017/auth_db',
};

export default dbConfig;
