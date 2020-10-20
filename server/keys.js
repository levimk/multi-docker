module.exports = {
  // Redis
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,

  // Postgres
  pgUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT
}