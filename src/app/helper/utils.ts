import path from "path";
import crypto from "crypto";
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";

let phoneUtil = PhoneNumberUtil.getInstance();
const PNF = PhoneNumberFormat;
function includes(haystack: any, needle: any) {
  return haystack.indexOf(needle) !== -1;
}

export const FILE_PARAMS = [
  "encoding",
  "filename",
  "fieldname",
  "mimetype",
  "originalname",
  "path",
  "size",
  "key",
];

export const groupBy = (array: any, type: any) => {
  if (!Array.isArray(array)) return array;
  return array.reduce(
    (r, v, i, a, k = v[type]) => ((r[k] || (r[k] = [])).push(v), r),
    {}
  );
};

export const errorSerialize = (error: any, prefix = "") => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace(prefix, "");
    errors[newKey] = error[key].map((obj: any) => obj.msg).join(", ");
  });
  return errors;
};

export const calculateAge = (dob: any) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export const pick = (data: any, toPick: any) =>
  pickBy(data, toPick, (values: any, v: any) => includes(values, v));

export const pickBy = (data: any, values: any, predicate: any) => {
  return Object.keys(data).reduce((c, v) => {
    if (predicate(values, v)) {
      c[v] = data[v];
      return c;
    }
    return c;
  }, {});
};

export const isAuthorized = (user: any, action: any) => {
  if (Array.isArray(action)) {
    return user.role.privileges.some((privilege: any) =>
      action.includes(privilege.module)
    );
  } else {
    return user.role.privileges.some(
      (privilege: any) => privilege.module == action
    );
  }
};
export const delay = (delayInms: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export const paging = (req: any) => {
  let page = req.query.page || 1;
  let perPage = req.query.perPage || 20;
  let limit = req.query.limit || 3;
  if (isNaN(Number(perPage))) {
    perPage = 20;
  }
  if (isNaN(Number(page))) {
    page - 1;
  }
  if (isNaN(Number(limit))) {
    limit = 3;
  }
  if (page - 1 >= 0) {
    page = page - 1;
  }
  return {
    page,
    perPage,
    limit,
  };
};
export const getExtension = (file: any) => {
  return path.extname(file);
};

export const generateMD5 = (value: any) => {
  return crypto.createHash("md5").update(value).digest("hex");
};
export const generateNonce = () => {
  return crypto.randomInt(100000, 999999);
};

export function pagination(total: any, perPage: any, currentPage: any) {
  const totalPage = Math.ceil(total / perPage);
  const next = currentPage + 2 <= totalPage ? currentPage + 2 : totalPage;
  const previous = currentPage >= 2 ? currentPage + 1 - 1 : 1;

  return {
    total,
    perPage,
    currentPage: Number(currentPage),
    next,
    totalPage,
    previous,
    pages: [...Array(totalPage).keys()],
  };
}

export const displayPhoneNumber = (phone: any, countryCode = "kh") => {
  try {
    //@ts-ignore
    let phoneNumber = phoneUtil.parseAndKeepRawInput(phone, countryCode);
    //@ts-ignore
    return phoneUtil.format(phoneNumber, PNF.NATIONAL);
  } catch (er) {
    return phone;
  }
};

export const formatPhoneNumber = (phone: any, countryCode = "kh") => {
  try {
    //@ts-ignore
    let phoneNumber = phoneUtil.parseAndKeepRawInput(phone, countryCode);
    //@ts-ignore
    phoneNumber = phoneUtil.format(phoneNumber, PNF.E164);
    return phoneNumber;
  } catch (error) {
    return "";
    console.log({ error });
  }
};

export const isPhoneValid = (phone: any, countryCode = "kh") => {
  try {
    //@ts-ignore
    const number = phoneUtil.parseAndKeepRawInput(
      phone,
      //@ts-ignore
      countryCode.countryCode
    );
    //@ts-ignore
    return phoneUtil.isValidNumber(number);
  } catch (error) {
    return false;
  }
};

export const getCountryCode = (phone: any) => {
  try {
    //@ts-ignore
    const numberProto = phoneUtil.parse(phone);
    const callingCode = numberProto.getCountryCode();
    const nationalNumber = numberProto.getNationalNumber();
    //@ts-ignore
    const countryCode =
      //@ts-ignore
      phoneUtil.getRegionCodeForCountryCode(callingCode);
    //@ts-ignore
    return { countryCode, phone: nationalNumber.toString() };
  } catch (error) {
    return { countryCode: "kh", phone: "" };
  }
};
export const deepSet = (obj: any, path: any, value: any) => {
  if (Object(obj) !== obj) return obj;
  if (!Array.isArray(path)) {
    path = (path || "").toString().match(/[^.[\]]+/g) || [];
  }
  path
    .slice(0, -1)
    .reduce(
      (a: any, c: any, i: any) =>
        Object(a[c]) === a[c]
          ? a[c]
          : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
      obj
    )[path[path.length - 1]] = value;
  return obj;
};

export const formDataExtractor = (data: any, key: any) => {
  let root = {};
  for (let param of data) {
    deepSet(root, param[key], param);
  }
  return root;
};

export const containsOnlyNumbers = (str: any) => /^\d+$/.test(str);
export default {
  pick,
  pickBy,
  isAuthorized,
  groupBy,
  errorSerialize,
  getExtension,
  generateMD5,
  isPhoneValid,
  displayPhoneNumber,
  formatPhoneNumber,
  getCountryCode,
  deepSet,
  formDataExtractor,
};
