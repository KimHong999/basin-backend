import { Request, Response } from "express";
import { generateMD5 } from "~/app/helper/utils";
import User from "~/app/models/User";
import { generateToken } from "~/config/jwt";
import { s3Upload } from "~/config/uploader";
import download from "image-downloader";
import LoginActivity from "~/app/models/LoginActivity";
import { userSerializer } from "~/app/serializer/api/users";

const CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const REDIRECT_URI = process.env.LINE_REDIRECT_URI;

export const getAccessToken = async (
  url: any,
  method: any,
  code: any,
  state: any
) => {
  return new Promise((resolve, reject) => {
    const data = {
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CHANNEL_ID,
      client_secret: CHANNEL_SECRET,
    } as any;
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
    })
      .then((res) => res.json())
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getProfile = async (access_token: any) => {
  return new Promise((resolve, reject) => {
    fetch("https://api.line.me/v2/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const verify = async (id_token: any, user_id: any) => {
  return new Promise((resolve, reject) => {
    const data = {
      id_token,
      client_id: CHANNEL_ID,
      user_id: user_id,
    } as any;
    fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
    })
      .then((res) => res.json())
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const create = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      auth_url: `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CHANNEL_ID}&redirect_uri=${REDIRECT_URI}&state=12345abcde&scope=profile%20openid%20email`,
    });
  } catch (error) {
    console.log(error);
  }
};

export const callback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;
    const data = (await getAccessToken(
      "https://api.line.me/oauth2/v2.1/token",
      "POST",
      code,
      state
    )) as any;
    const profile = (await getProfile(data.access_token)) as any;
    const verifyProfile = (await verify(data.id_token, profile.userId)) as any;
    const params = {
      username: verifyProfile.name,
      email: verifyProfile.email,
      provider: "line",
      uuid: verifyProfile.sub,
    } as any;
    if (!params.username && !params.email && !params.uuid) {
      return res.status(400).json({ message: "Invalid user data." });
    }
    let account = (await User.query()
      .where({ uuid: params.uuid, provider: "line" })
      .withGraphFetched('subscribe')
      .first()) as any;
    if (!account) {
      if (verifyProfile.email) {
        const user = (await User.query().findOne({
          email: verifyProfile.email,
        })) as any;
        if (user) {
          return res.status(400).json({
            message: `Your email is connect with ${user.provider} provider. Please choose difference login method.`,
          });
        }
      }
      const key = generateMD5(`${+new Date()}${verifyProfile.sub}`);
      const filePath = `${process.cwd()}/storages/uploads/${key}.jpg`;
      await download.image({
        url: verifyProfile.picture,
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
      message: "You have successfully login with line account.",
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
