import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";
import fs from "fs";
import mime from "mime";
import crypto from "crypto";

const generateMD5 = (value: any) =>
  crypto.createHash("md5").update(value).digest("hex");
const getExtension = (file: any) => path.extname(file);

const ENV = process.env;
const config = {
  region: ENV.FOG_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SCERTE_KEY_ID,
  },
} as any;

const s3 = new S3Client(config);
const bucket = ENV.FOG_DIRECTORY;

export const s3Upload = (url: any, prefix = "uploads") => {
  const file = fs.createReadStream(url);
  const extension = getExtension(file.path);
  const key = generateMD5(`${file.path}${+new Date()}`);
  const filePath = `${prefix}/${key}${extension}`;
  const contentType = mime.getType(url);
  var params = {
    ACL: "public-read",
    Bucket: bucket,
    Body: file,
    Key: filePath,
    ContentType: contentType,
  } as any;
  return new Promise(async (resolve, reject) => {
    try {
      const uploader = new Upload({
        client: s3,
        params,
      });
      await uploader.done();
      resolve(filePath);
    } catch (err) {
      resolve("");
    }
  });
};

module.exports = {
  s3Upload,
  s3,
};
