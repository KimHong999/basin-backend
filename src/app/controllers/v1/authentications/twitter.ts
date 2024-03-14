import { Request, Response } from "express";
import { generateMD5 } from "~/app/helper/utils";
import User from "~/app/models/User";
import { generateToken } from "~/config/jwt";
import { s3Upload } from "~/config/uploader";
import download from "image-downloader";
import LoginActivity from "~/app/models/LoginActivity";
import { userSerializer } from "~/app/serializer/api/users";

const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const authCallback = process.env.AUTH_CALLBACK;

const oauth = new (require("oauth").OAuth)(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  CONSUMER_KEY,
  CONSUMER_SECRET,
  "1.0",
  authCallback,
  "HMAC-SHA1"
);

export const getOAuthRequestToken = () => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken(
      (error: any, oauth_token: any, oauth_token_secret: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve({ oauth_token, oauth_token_secret, results });
        }
      }
    );
  });
};

export const getProtectedResource = (
  url: string,
  method: any,
  oauth_access_token: any,
  oauth_access_token_secret: any
) => {
  return new Promise((resolve, reject) => {
    let params = { include_email: "true" };
    oauth.getProtectedResource(
      url,
      method,
      oauth_access_token,
      oauth_access_token_secret,
      (error: any, data: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve({ data, response });
        }
      },
      params
    );
  });
};

export const getOAuthAccessToken = (
  oauth_token: any,
  oauth_token_secret: any,
  oauth_verifier: any
) => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthAccessToken(
      oauth_token,
      oauth_token_secret,
      oauth_verifier,
      (
        error: any,
        oauth_access_token: any,
        oauth_access_token_secret: any,
        results: any
      ) => {
        if (error) {
          reject(error);
        } else {
          resolve({ oauth_access_token, oauth_access_token_secret, results });
        }
      }
    );
  });
};

let oauth_token_secrete_key: any;

export const create = async (req: Request, res: Response) => {
  try {
    const { oauth_token_secret, oauth_token } =
      (await getOAuthRequestToken()) as any;
    oauth_token_secrete_key = oauth_token_secret;
    res.status(200).json({
      authUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`,
    });
  } catch (error) {
    console.log(error);
  }
};

export const callback = async (req: Request, res: Response) => {
  try {
    let oauth_token_secret = oauth_token_secrete_key;
    const { oauth_token, oauth_verifier } = req.body;
    const { oauth_access_token, oauth_access_token_secret } =
      (await getOAuthAccessToken(
        oauth_token,
        oauth_token_secret,
        oauth_verifier
      )) as any;
    const response = (await getProtectedResource(
      "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
      "GET",
      oauth_access_token,
      oauth_access_token_secret
    )) as any;
    const data = await JSON.parse(response.data);
    const params = {
      username: data.screen_name,
      email: data.email,
      provider: "x",
      uuid: data.id_str,
    } as any;
    let account = (await User.query()
      .where({ uuid: params.uuid, provider: "x" })
      .withGraphFetched('subscribe')
      .first()) as any;
    if (!account) {
      if (data.email) {
        const user = (await User.query().findOne({
          email: data.email,
        })) as any;
        if (user) {
          return res.status(400).json({
            message: `Your email is connect with ${user.provider} provider. Please choose difference login method.`,
          });
        }
      }
      const key = generateMD5(`${+new Date()}${data.sub}${data.nonce}`);
      const filePath = `${process.cwd()}/storages/uploads/${key}.jpg`;
      await download.image({
        url: data.profile_image_url,
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
      message: "You have successfully login with twitter account.",
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
