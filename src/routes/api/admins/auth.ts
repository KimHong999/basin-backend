import express from "express";
import * as contoller from "~/app/controllers/v1/api/admins/auth";
import authMiddleware from "~/middleware/adminAuth";

require("express-async-errors");
const masterAuthRouter = express.Router();

masterAuthRouter.route("/").post(contoller.login);
masterAuthRouter.route("/logout").delete(authMiddleware, contoller.logout);

export default masterAuthRouter;
