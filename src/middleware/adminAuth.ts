import { Request, Response, NextFunction } from "express";
import { verifyToken, clearSession } from "../config/jwt";
import Admin from "~/app/models/Admin";

const handleClearToken = (token: any) => clearSession(token);

export default async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];
  if (authorization && authorization.split(" ")[0] === "Bearer") {
    const token = authorization.split(" ")[1];
    try {
      const keyIndex = await redis.get(token);
      if (keyIndex) {
        return res.status(401).json({ message: "unauthorized" });
      }
      const payload = (await verifyToken(token)) as any;
      const account = await Admin.query()
        .findOne({
          id: payload.id,
          email: payload.email,
        })
        .withGraphFetched("role.privileges");
      if (!account) {
        handleClearToken(token);
        return res.status(401).json({ message: "unauthorized" });
      }
      //@ts-ignore
      if (account?.status === "suspended") {
        handleClearToken(token);
        return res.status(401).json({ message: "Your account is suspended!" });
      }
      req.decoded = payload;
      req.currentUser = account;
      req.auth_token = token;
      next();
      return;
    } catch (e: any) {
      if (e?.name == "TokenExpiredError") {
        handleClearToken(token);
      }
      console.log(e);
    }
  }
  return res.status(401).json({ message: "unauthorized" });
};
