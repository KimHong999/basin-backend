import CryptoJS from "crypto-js";

export const encryptKey = (value: any, withObject: boolean) => {
  const encryptText = withObject ? JSON.stringify(value) : value;
  const key = CryptoJS.AES.encrypt(
    encryptText,
    process.env.ENCRYPT_KEY || ""
  ).toString();
  return key;
};

export const decryptKey = (value: string, withObject?: boolean) => {
  try {
    var bytes = CryptoJS.AES.decrypt(value, process.env.ENCRYPT_KEY || "");
    const originalText = bytes?.toString(CryptoJS.enc.Utf8);
    if (withObject) {
      return originalText ? JSON.parse(originalText) : {};
    } else {
      return originalText;
    }
  } catch (err) {
    return null;
  }
};
