import express from "express";
import * as controllers from "~/app/controllers/v1/api/admins/users";
import adminAuth from "~/middleware/adminAuth";

require("express-async-errors");

const postRouter = express.Router();

postRouter.route("/").get(adminAuth, controllers.list);
postRouter.route("/:id").get(adminAuth, controllers.detail);

export default postRouter;
