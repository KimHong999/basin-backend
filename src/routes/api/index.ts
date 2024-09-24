import express from "express";
import * as controller from "~/app/controllers/v1/api/admins/members";
import * as categoryController from "~/app/controllers/v1/api/categories";

const router = express.Router();

router.route("/members").get(controller.lists);
router.route("/members/:id").get(controller.detail);
router.route("/members").post(controller.create);
router.route("/members/:id").put(controller.update);
router.route("/members/:id").delete(controller.destroy);

router.route("/categories").get(categoryController.list);
router.route("/categories").post(categoryController.create);

export default router;
