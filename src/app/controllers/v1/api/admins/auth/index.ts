import { Request, Response } from "express";
import Admin from "~/app/models/Admin";
import LoginActivity from "~/app/models/LoginActivity";
import { generateToken, clearSession } from "~/config/jwt";
import { profileSerializer } from "~/app/serializer/admins/profile";

export const login = async (req: Request, res: Response) => {
  const params = req.parameters.permit("email", "password").value();
  const { email, password } = params;
  const error = "Email or password is incorrect";
  try {
    const account = await Admin.query()
      .whereRaw("LOWER(email) = ?", email.toLowerCase())
      .andWhere("status", "active")
      .first();
    if (!account) {
      return res.status(400).json({
        message: error,
      });
    }
    const isValid = await account.validPassword(password);
    //@ts-ignore
    if (isValid) {
      await loginActivity(req, account, "login");
      const token = await generateToken(account);
      return res.status(200).json({
        token: token,
        data: profileSerializer(account),
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
const loginActivity = async (req: any, adminId: any, action: any) => {
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
    admin_id: adminId.id,
    action,
  });
};
