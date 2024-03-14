import express from "express";
import userAuthRouter from "./auth";
import accountRouter from "./accounts";

require("express-async-errors");

export const routes = express.Router();

routes.use("/account", accountRouter);
routes.use("/auth", userAuthRouter);
