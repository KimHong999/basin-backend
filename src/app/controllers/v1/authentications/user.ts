import User from "~/app/models/User";
import { Request, Response } from "express";
import { generateToken, clearSession } from "~/config/jwt";
import { userSerializer } from "~/app/serializer/api/users";
import LoginActivity from "~/app/models/LoginActivity";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

export const login = async (req: Request, res: Response) => {
  const params = req.parameters.permit("email", "password").value();
  const { email, password } = params;
  const error = "Email or password is incorrect";
  try {
    const account = (await User.query()
      .whereRaw("LOWER(email) = ?", email.toLowerCase())
      .withGraphFetched("subscribe")
      .first()) as any;
    if (!account) {
      return res.status(400).json({
        message: error,
      });
    }
    //@ts-ignore
    const isValid = await account.validPassword(password);
    if (isValid) {
      await account.$query().patch({
        current_sign_in_at: new Date(),
        last_sign_in_at: account.current_sign_in_at,
        //@ts-ignore
        current_sign_in_ip: req.ipInfo.ip,
        last_sign_in_ip: account.current_sign_in_ip,
        sign_in_count: Number(account.sign_in_count) + 1,
      });
      await loginActivity(req, account, "login");
      const token = await generateToken(account);
      return res.status(200).json({
        token: token,
        data: userSerializer(account),
        message: "You have successfully login",
      });
    }
    res.status(400).json({
      message: error,
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await loginActivity(req, req.decoded.id, "logout");
    await clearSession(req.auth_token);
    res.status(200).json({
      message: "Logout success",
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};
const loginActivity = async (req: any, userId: any, action: any) => {
  const userAgent = req.useragent;
  const ipAddress = req.ipInfo;
  const agentData = {
    browser: userAgent.browser,
    os: userAgent.os,
    platform: userAgent.platform,
    source: userAgent.source,
  };
  const ipData = {
    ip: ipAddress.ip,
    city: ipAddress.city,
    country: ipAddress.country,
    timezone: ipAddress.timezone,
  };
  await LoginActivity.query().insert({
    ip_address: ipData.ip,
    country: ipData.country + " " + ipData.city + " " + ipData.timezone,
    os: agentData.os,
    browser: agentData.browser,
    platform: agentData.platform,
    source: agentData.source,
    user_id: userId.id,
    action,
  });
};

export const register = async (req: Request, res: Response) => {
  const params = req.parameters
    .permit(
      "first_name",
      "last_name",
      "gender",
      "email",
      "password",
      "phone",
      "username",
      "dob"
    )
    .value();
  try {
    const { email, password, phone, first_name, last_name, gender, dob } =
      params;

    const account = await User.query()
      .whereRaw("LOWER(email) = ?", email.toLowerCase())
      .first();
    if (account) {
      return res.status(400).json({
        message: "Email already exist",
      });
    } else {
      const hash = bcrypt.hashSync(password, 12);
      //@ts-ignore
      const newAccount = await User.query()
        .insert({
          //@ts-ignore
          email,
          password: hash,
          phone,
          first_name,
          last_name,
          gender,
          dob,
        })
        .returning("*");
      await loginActivity(req, newAccount, "register");
      const token = await generateToken(newAccount);
      return res.status(200).json({
        token: token,
        data: userSerializer(newAccount),
        message: "You have successfully Register",
      });
    }
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};

export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.decoded;
    const user = (await User.query().findById(id)) as any;
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const timestamp = dayjs().unix();
    await user.$query().patch({
      deleted_at: new Date(),
      email: `${timestamp}_${user.email}`,
      phone: `${timestamp}_${user.phone}`,
    });
    return res.status(200).json({
      message: "User has been deleted !",
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};
