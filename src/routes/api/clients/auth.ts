import express from "express";
import * as controller from "~/app/controllers/v1/authentications/user";
import * as twitterController from "~/app/controllers/v1/authentications/twitter";
import * as lineController from "~/app/controllers/v1/authentications/line";
import * as googleController from "~/app/controllers/v1/authentications/google";
import * as passwordController from "~/app/controllers/v1/authentications/password/forget_password";
import { userAuthMiddleware } from "~/middleware/auth";
import { registerValidator } from "~/app/validators/api/users";
import {
  forgetPasswordValidator,
  resetPasswordValidator,
} from "~/app/validators/api/forget_password";
import errorValidator from "~/middleware/errorValidator";

require("express-async-errors");
const userAuthRouter = express.Router();

userAuthRouter.route("/").post(controller.login);
userAuthRouter.route("/register").post(registerValidator, errorValidator, controller.register);
userAuthRouter.route("/twitter").post(twitterController.create);
userAuthRouter
  .route("/forget_password")
  .post(forgetPasswordValidator, passwordController.forgetPassword);
userAuthRouter
  .route("/reset_password/:token")
  .put(resetPasswordValidator, passwordController.resetPassword);
userAuthRouter.route("/twitter/callback").post(twitterController.callback);
userAuthRouter.route("/line").post(lineController.create);
userAuthRouter.route("/line/callback").post(lineController.callback);
userAuthRouter.route("/google").post(googleController.create);
userAuthRouter.route("/google/callback").post(googleController.callback);
userAuthRouter.route("/logout").delete(userAuthMiddleware, controller.logout);
export default userAuthRouter;
