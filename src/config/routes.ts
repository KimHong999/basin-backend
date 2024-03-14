import { Express, Request, Response, NextFunction } from "express";
//@ts-ignore
import expressip from "express-ip";
import * as Sentry from "@sentry/node";
//@ts-ignore
import params from "strong-params";
import { routes } from "../routes/api/clients";
import { MulterFileExtension } from "../app/helper/errors";
import { adminRoutes } from "~/routes/api/admins";
import i18n from "~/config/i18n";

require("express-async-errors");

export default (app: Express) => {
  app.use(expressip().getIpInfoMiddleware);
  app.use(params.expressMiddleware());
  if (process.env.SENTRY_DNS) {
    Sentry.init({
      dsn: process.env.SENTRY_DNS,
      //@ts-ignore
      flushTimeout: 10,
      maxBreadcrumbs: 50,
      debug: true,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({
          app,
        }),
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      ],
      tracesSampleRate: 1.0,
    });
  }
  app.use((req, _res, next) => {
    let language = req.headers["accept-language"] || "en";
    if (!["en", "ja"].includes(language)) {
      language = "en";
    }
    req.headers["accept-language"] = language;
    next();
  });
  app.use(i18n.init);

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: `Knock Knock, I'm home` });
  });
  app.use("/api/v1", routes);
  app.use("/api/v1/admins", adminRoutes);
  app.use((req: Request, res: Response) => {
    return res.status(404).json({ message: `Route ${req.url} Not found.` });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof MulterFileExtension) {
      return res.status(400).json(err.message);
    }
    return res.status(500).json({ message: err.message });
  });
};
