import { checkSchema } from "express-validator";
import { ValidatorRequest } from "~/app/types";

export const forgetPasswordValidator = checkSchema({
  email: {
    in: ["body"],
    notEmpty: true,
    errorMessage: (_: any, { req }: ValidatorRequest) =>
      req.__("validation.empty.blank", {
        attribute: req.__("attributes.title"),
      }),
  },
});

export const resetPasswordValidator = checkSchema({
  password: {
    in: ["body"],
    notEmpty: true,
    errorMessage: (_: any, { req }: ValidatorRequest) =>
      req.__("validation.empty.blank", {
        attribute: req.__("attributes.password"),
      }),
    custom: {
      options: (value, { req }) => {
        if (value.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        return value;
      },
    },
  },
  password_confirmation: {
    in: ["body"],
    notEmpty: true,
    errorMessage: (_: any, { req }: ValidatorRequest) =>
      req.__("validation.empty.blank", {
        attribute: req.__("attributes.password_confirmation"),
      }),
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password confirmation does not match password");
        }
        return value;
      },
    },
  },
});
