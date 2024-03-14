import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { generateMD5 } from "~/app/helper/utils";
import User from "~/app/models/User";
import { generateToken } from "~/config/jwt";
import { s3Upload } from "~/config/uploader";
import download from "image-downloader";
import LoginActivity from "~/app/models/LoginActivity";
import { userSerializer } from "~/app/serializer/api/users";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const getAccessToken = async (code: any) => {
  const { tokens } = await client.getToken(code);
  return tokens;
};

export const getProfile = async (access_token: any) => {
  const ticket = await client.verifyIdToken({
    idToken: access_token,
    audience: CLIENT_ID,
  });
  return ticket.getPayload();
};

export const verify = async (id_token: any) => {
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: CLIENT_ID,
  });
  return ticket.getPayload();
};

export const create = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      auth_url: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=email%20profile&access_type=offline`,
    });
  } catch (error) {
    console.log(error);
  }
};

export const callback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const data = (await getAccessToken(code)) as any;
    const profile = (await getProfile(data.id_token)) as any;
    const params = {
      email: profile.email,
      username: profile.name,
      profile: profile.picture,
      provider: "google",
      uuid: profile.sub,
    };
    if (!params.username && !params.email && !params.uuid) {
      return res.status(400).json({ message: "Invalid user data." });
    }
    let account = (await User.query()
      .where({ uuid: params.uuid, provider: "google" })
      .withGraphFetched('subscribe')
      .first()) as any;
    if (!account) {
      if (profile.email) {
        const user = (await User.query().findOne({
          email: profile.email,
        })) as any;
        if (user) {
          return res.status(400).json({
            message: `Your email is connect with ${user.provider} provider. Please choose difference login method.`,
          });
        }
      }
      const key = generateMD5(`${+new Date()}${profile.sub}`);
      const filePath = `${process.cwd()}/storages/uploads/${key}.jpg`;
      await download.image({
        url: profile.picture,
        dest: filePath,
      });
      const s3Key = await s3Upload(filePath, "storages/uploads");
      params.profile = s3Key;
      account = await User.query().insertAndFetch(params);
    }

    if (account.status === "blocked") {
      return res.status(400).json({ message: "Your account is blocked!" });
    }
    const token = await generateToken(account);
    await loginActivity(req, account, "login");
    res.status(200).json({
      token: token,
      data: userSerializer(account),
      message: "You have successfully login with Google account.",
    });
  } catch (error) {
    console.log(error);
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
