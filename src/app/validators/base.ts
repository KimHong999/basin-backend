export const errorSerialize = (error: any, modelKey: any) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace(`${modelKey}.`, "");
    errors[newKey] = error[key].map((obj: any) => obj.msg).join(", ");
  });
  return errors;
};
