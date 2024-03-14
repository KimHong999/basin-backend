import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import { errorSerialize, groupBy } from "~/app/helper/utils";

export default (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = groupBy(result.array(), "path");
    const errorsMessage = errorSerialize(errors, "campaign");

    return res.status(400).json({
      errors: errorsMessage,
      message: "Oop, sorry. Something went wrong with your input data.",
    })
  }

  next()
}