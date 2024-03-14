require("dotenv").config();
const pg = require("pg").types;
const { setTypeParser, builtins } = pg;
const typesToReset = [
  builtins.DATE,
  builtins.TIME,
  builtins.TIMETZ,
  builtins.TIMESTAMP,
  builtins.TIMESTAMPTZ,
];
function resetPgDateParsers() {
  for (const pgType of typesToReset) {
    setTypeParser(pgType, (val: any) => String(val)); // like noParse() function underhood pg lib
  }
}

resetPgDateParsers();
const connection = {
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME,
  },
  pool: { min: 0, max: 100 },
};

const rootPath = process.cwd();
const migrations = {
  migrations: {
    directory: rootPath + "/src/db/migrations",
  },
  seeds: {
    directory: rootPath + "/src/db/seeds",
  },
};

module.exports = {
  development: {
    ...connection,
    ...migrations,
  },

  production: {
    ...connection,
    ...migrations,
    pool: {
      min: 2,
      max: 50,
    },
  },
};
