import express from "express";
import * as controller from "~/app/controllers/v1/api/admins/roles";
import adminAuth from "~/middleware/adminAuth";

require("express-async-errors");

const rolesRouter = express.Router();

rolesRouter.route("/").get(adminAuth, controller.list);
rolesRouter
  .route("/privileges")
  .get(adminAuth, controller.listPrivileges);
rolesRouter.route("/").post(adminAuth, controller.create);
rolesRouter.route("/:id").get(adminAuth, controller.detail);
rolesRouter.route("/:id").put(adminAuth, controller.update);

export default rolesRouter;
