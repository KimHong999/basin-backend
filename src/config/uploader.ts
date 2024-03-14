import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import mime from "mime";
import { generateMD5, getExtension } from "../app/helper/utils";

const ENV = process.env;

let s3Storage;
const bucket = ENV.FOG_DIRECTORY || "";
const config = {
  region: ENV.FOG_REGION || "",
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: ENV.AWS_SCERTE_KEY_ID || "",
  },
};
let s3 = null as any;
if (ENV.STORAGE === "s3") {
  s3 = new S3Client(config);
  s3Storage = multerS3({
    s3,
    bucket: bucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: async (req, file, cb) => {
      const extension = getExtension(file.originalname);
      const uuid = nanoid();
      const key = generateMD5(`${+new Date()}${uuid}`);
      const filePath = `${getBucketPath(file)}${key}${extension}`;
      cb(null, filePath);
    },
  });
}

const checkAvatarFileType = (req: Request, file: any, cb: any) => {
  const fileTypes = /jpeg|png|jpg|webp|mp4|pdf|gif/;
  const extName = fileTypes.test(
    path.extname(file.originalname).toLocaleLowerCase()
  );
  const mimeType = fileTypes.test(file.mimetype);
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb({
      message: `Unsupport file type. File Type Support ${fileTypes}. File Name ${extName} Mime ${file.mimetype}`,
    });
  }
};

const getBucketPath = (file: any) => {
  if (file.fieldname === "avatar") {
    return "uploads/avatar/";
  }
  return "uploads/attachments/";
};
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/storages/uploads");
  },
  filename: function (req, file, cb) {
    const extension = getExtension(file.originalname);
    const uuid = nanoid();
    const key = generateMD5(`${+new Date()}${uuid}`);
    const filePath = `${key}${extension}`;
    cb(null, filePath);
  },
});
const storage = {
  disk: diskStorage,
  s3: s3Storage,
};

const upload = multer({
  storage: storage[process.env.STORAGE || "disk"],
  fileFilter: (req, file, cb) => {
    return checkAvatarFileType(req, file, cb);
    // cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const offlineUpload = multer({
  storage: storage["disk"],
  fileFilter: (req, file, cb) => {
    return checkAvatarFileType(req, file, cb);
    // cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

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
      console.log(err);
      resolve("");
    }
  });
};
export const s3Uploader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (ENV.STORAGE === "s3") {
    if (req.file) {
      const s3Key = await s3Upload(req.file.path, "uploads/attachments");
      //@ts-ignore
      req.file.key = s3Key;
      await fs.unlinkSync(req.file.path);
    }
    if (req.files) {
      //@ts-ignore
      for (let i = 0;i < req.files.length;i++) {
        const s3Key = await s3Upload(req.files[i].path, "uploads/attachments");
        req.files[i].key = s3Key;
      }
    }
  }
  next();
};

async function getSignedUrl(key: any) {
  return new Promise((resolve, reject) => {
    const expires = 86400; // 1 days
    if (!key) {
      return resolve(null);
    }
    const params = { Bucket: bucket, Key: key, Expires: expires };
    s3.getSignedUrl("getObject", params, (err: any, endpoint: any) => {
      if (err) reject(err);
      if (!endpoint) {
        return resolve(null);
      }
      //@ts-ignore
      var uri = url.parse(endpoint);
      resolve(uri.path);
    });
  });
}

export const getImage = (key: any) => getSignedUrl(key);
export const getImagePath = (key: any) => `/${bucket}/${key}`;

export const deleteS3Object = async (key: any) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const data = await s3.send(new DeleteObjectCommand(params));
    return data;
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
};

export const deleteLocalObject = async (url: any) => {
  try {
    const path = process.cwd() + "/storages/uploads/" + url;
    await fs.unlinkSync(path);
    console.log("remove file successfully");
  } catch (err) {
    console.log(`remove file failure ${JSON.stringify(err)}`);
  }
};

export const deleteObject = async (url: any) => {
  try {
    if (ENV.STORAGE === "s3") {
      await deleteS3Object(url);
    } else {
      await deleteLocalObject(url);
    }
  } catch (err) {
    console.log(`===================`);
    console.log(err);
    console.log(`===================`);
  }
};
export default upload;
