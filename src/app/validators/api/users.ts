import { checkSchema } from "express-validator";
import User from "../../models/User";
import bcrypt from "bcrypt";

export const registerValidator = checkSchema({
  email: {
    in: ["body"],
    notEmpty: true,
    errorMessage: () => "Email is required",
    custom: {
      options: async (value, { req }) => {
        if (value) {
          //@ts-ignore
          const project_token = req.headers["project-token"];
          const user = await User.query()
            .whereRaw("LOWER(email) = ?", value.toLowerCase())
            .first();
          if (user) {
            return Promise.reject(
              "Email already exist, please try another email"
            );
          }
        }
        return value;
      },
    },
  },
  password: {
    in: ["body"],
    notEmpty: true,
    isLength: {
      errorMessage: () => "Password must be at least 6 chars long",
      options: { min: 6 },
    },
    errorMessage: () => "Password is required",
  },
});

export const changePasswordValidator = checkSchema({
  current_password: {
    in: ["body"],
    notEmpty: true,
    errorMessage: () => "Current password is required",
    custom: {
      options: async (value, { req }) => {
        const user = await User.query().findById(req.currentUser.id);
        if (!user) {
          return Promise.reject(
            "User not found, please try to re-login and try again"
          );
        }
        //@ts-ignore
        if (!bcrypt.compareSync(value, user.password)) {
          return Promise.reject(
            "Current password is not match with your current password"
          );
        }
        return value;
      },
    },
  },
  new_password: {
    in: ["body"],
    notEmpty: true,
    isLength: {
      errorMessage: () =>
        "New password must be at least 6 chars long and match with password confirmation",
      options: { min: 6 },
    },
    errorMessage: () =>
      "New password is required and must be match with password confirmation",
    custom: {
      options: async (value, { req }) => {
        if (req.body.confirm_password != value) {
          return Promise.reject(
            "New password must be match with password confirmation"
          );
        }
        return value;
      },
    },
  },
  confirm_password: {
    in: ["body"],
    notEmpty: true,
    errorMessage: () =>
      "Password confirmation is required and must be match with new password",
    isLength: {
      errorMessage: () =>
        "Password confirmation must be at least 6 chars long and match with new password",
      options: { min: 6 },
    },
  },
});

export const updateProfileValidator = checkSchema({
  username: {
    in: ["body"],
    notEmpty: true,
  },
  bio: {
    in: ["body"],
    isLength: {
      options: { max: 50 },
      errorMessage: "Bio should be less than 50 chars",
    },
  },
});
