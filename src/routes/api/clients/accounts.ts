import express from "express";
import * as controller from "~/app/controllers/v1/api/accounts";
import {
  updateProfileValidator,
  changePasswordValidator,
} from "~/app/validators/api/users";
import upload from "~/config/uploader";
import { userAuthMiddleware } from "~/middleware/auth";
import errorValidator from "~/middleware/errorValidator";

require("express-async-errors");

const accountRouter = express.Router();

accountRouter.route("/").get(userAuthMiddleware, controller.profile);
accountRouter.route("/").put(
  userAuthMiddleware,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateProfileValidator,
  controller.update
);
accountRouter
  .route("/change-password")
  .put(
    userAuthMiddleware,
    changePasswordValidator,
    errorValidator,
    controller.changePassword
  );

export default accountRouter;
