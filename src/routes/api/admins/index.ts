import express from "express";
import accountRouter from "./accounts";
import roleRouter from "./roles";
import masterAuthRouter from "./auth";
import useRouter from "./users";
import memberRouter from "./members";

require("express-async-errors");

export const adminRoutes = express.Router();
adminRoutes.use("/auth", masterAuthRouter);
adminRoutes.use("/accounts", accountRouter);
adminRoutes.use("/roles", roleRouter);
adminRoutes.use("/users", useRouter);
adminRoutes.use("/members", memberRouter);
