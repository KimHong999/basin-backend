import helper from "../app/helper/utils";
import { Request, Response, NextFunction } from "express";

export default (controller: any, action: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!helper.isAuthorized(req.currentUser, `${controller}-${action}`)) {
      return res
        .status(403)
        .json({ message: "you are not allow access this feature" });
    }
    next();
  };
