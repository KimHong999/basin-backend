//@ts-ignore
import config from "./src/config/database";

const environment = process.env.NODE_ENV || "development";
const knexConfig = config[environment];

export default knexConfig;
