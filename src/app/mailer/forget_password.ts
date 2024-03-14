import Mailer from "~/config/mailer";
import juice from "juice";
import { encryptKey } from "../helper/encryptData";
import pug from "pug";

export const sendResetPasswordMail = async (user: any) => {
  const mailer = new Mailer({
    subject: "Your Reset Password Link",
    receiver: user.email,
  });
  const resetObject = { email: user.email, token: user.reset_password_token };
  const encryptData = encryptKey(resetObject, true);
  const link = `${process.env.FRONTEND_URL}/auth/reset-password?data=${encryptData}}`;
  const html = pug.renderFile("src/templates/reset_password.pug", {
    name: user.last_name + " " + user.first_name,
    website_link: process.env.FRONTEND_URL,
    link,
  });
  const template = juice(html);
  await mailer.send(template);
};
