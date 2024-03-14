import jwt from "jsonwebtoken";
import { authConfig } from ".";

export const generateToken = (user: any) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        email: user.email,
        id: user.id,
      },
      //@ts-ignore
      authConfig.secret,
      {
        algorithm: authConfig.algorithms[0],
        expiresIn: "48h",
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        if (!token) {
          return new Error("Empty token");
        }

        return resolve(token);
      }
    );
  });
};

export const verifyToken = async (token: string) =>
  //@ts-ignore
  jwt.verify(token, authConfig.secret);

export const clearSession = (token: any) => redis.invokeToken(token);
