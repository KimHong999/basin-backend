import "dotenv/config";

export const authConfig = {
  algorithms: ["HS256"],
  secret: process.env.JWT_SECRET,
};
