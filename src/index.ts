import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import objection, { Model } from "objection";
import methodOverride from "method-override";
import path from "path";
import routes from "./config/routes";
//@ts-ignore
import knexCofig from "./config/database";
import compression from "compression";
import helmet from "helmet";
import useragent from "express-useragent";
//@ts-ignore
import paranoia from "objection-paranoia";
import redis from "./config/redis";
declare global {
  var parameters: any;
  var auth_token: any;
  var currentUser: any;
  var decoded: any;
  var redis: any;
  var isProduction: any;
  var env: any;
  var ROOT_PATH: any;
}

export const bootstrap = async () => {
  const app = express();
  const http = require("http").Server(app);
  const environment = process.env.NODE_ENV || "development";
  const db = require("knex")(knexCofig[environment]);
  const env = process.env.NODE_ENV || "development";
  const PORT = process.env.PORT || 5050;

  global.redis = null;
  global.isProduction = env !== "development";
  global.env = env;
  global.ROOT_PATH = __dirname;

  const productionLog =
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] ":referrer" ":user-agent"';
  const logMode = app.get("env") === "development" ? "dev" : productionLog;

  app.use(useragent.express());
  app.set("trust proxy", true);
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: false,
  //     crossOriginEmbedderPolicy: false,
  //   })
  // );
  app.use(compression());
  app.use(morgan(logMode));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());
  app.use(
    methodOverride((req, res) => {
      if (
        (req.body && "_method" in req.body) ||
        (req.query && req.query._method == "put")
      ) {
        const method = req.body._method || req.query._method;
        delete req.body._method;
        return method;
      }
    })
  );
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "../public")));

  paranoia.register(objection);
  Model.knex(db);
  routes(app);
  const server = http.listen(PORT, async () => {
    await redis.connect();
    global.redis = redis;
    console.log(`Server now listening at localhost: ${PORT}`);
  });
  server.on("close", () => {
    console.log("Closed express server");
    db.pool.end(() => {
      console.log("Shut down connection pool");
    });
  });
};

bootstrap();
