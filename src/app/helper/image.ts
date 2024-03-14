import "dotenv/config";

export const getImage = (file: string) => {
  if (!file) return null;
  let basePath = `${process.env.BASE_URL}/uploads/`;
  if (process.env.STORAGE === "s3") {
    basePath = `${process.env.ENDPOINT}/${process.env.FOG_DIRECTORY}/`;
  }

  return `${basePath}${file.replace(basePath, "")}`;
};
