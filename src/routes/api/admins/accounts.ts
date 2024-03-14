import express from "express";
import * as controller from "~/app/controllers/v1/api/admins/accounts";
import adminAuth from "~/middleware/adminAuth";

require("express-async-errors");

const accountRouter = express.Router();

accountRouter.route("/").get(adminAuth, controller.profile);

export default accountRouter;
