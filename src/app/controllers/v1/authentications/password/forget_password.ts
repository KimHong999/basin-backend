import User from "~/app/models/User";
import crypto from "crypto";
import { sendResetPasswordMail } from "~/app/mailer/forget_password";
import dayjs from "dayjs";

export const forgetPassword = async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const user = (await User.query()
      .whereRaw("LOWER(email) = ?", email.toLowerCase())
      .first()) as any;
    if (!user) {
      return res.status(400).json({
        message: "Email not found",
      });
    }
    if (user.provider) {
      user.provider = user.provider.toUpperCase();
      return res.status(400).json({
        message: `You have registered with ${user.provider}. Please login with ${user.provider}`,
      });
    }
    const code = crypto.randomBytes(30).toString("hex");
    await user.$query().patch({
      reset_password_token: code,
      reset_password_sent_at: new Date(),
    });
    await sendResetPasswordMail(user);
    return res.status(200).json({
      message: "Reset password link has been sent to your email",
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const { token } = req.params;
    const params = req.parameters
      .permit("password", "password_confirmation")
      .value();
    const user = (await User.query()
      .where({ reset_password_token: token })
      .whereNotNull("reset_password_sent_at")
      .first()) as any;
    const timeDiff = dayjs().diff(dayjs(user.reset_password_sent_at), "hour");
    if (timeDiff > 1) {
      return res.status(400).json({
        message: "Reset password link has been expired",
      });
    }
    await user.resetPassword(params.password);
    return res.status(200).json({
      message: "Password has been reset",
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};
