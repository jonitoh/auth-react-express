export type DbConfig = {
  HOST: string,
  PORT: number,
  DB: string,
  URI: string,
}

const dbConfig: DbConfig = {
  HOST: (process.env.DB_HOST || "localhost") as string,
  PORT: (process.env.DB_PORT || 27017) as number,
  DB: (process.env.DB_NAME || "auth_db") as string,
  URI: (process.env.DB_URI || "mongodb://localhost:27017/auth_db") as string,
};

export default dbConfig;


