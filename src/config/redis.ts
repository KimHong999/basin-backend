import "dotenv/config";

import { createClient } from "redis";

const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_PORT || 6379;
const redisOption = { url: `redis://${host}:${port}/8`, network_timeout: 5 };
const client = createClient(redisOption);

const findMatchKey = (regKey: any) => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    client.keys(regKey, (err, foundKeys) => {
      if (err) return reject(err);
      resolve(foundKeys[0]);
    });
  });
};
//@ts-ignore
client.findMatchKey = findMatchKey;
//@ts-ignore
client.delByMatchKeys = (regKeys: any) => {
  regKeys = [].concat(regKeys);
  for (let i = 0, len = regKeys.length; i < len; i++) {
    //@ts-ignore
    client.keys(regKeys[i], (err, foundKeys) => {
      if (err) return;
      if (foundKeys.length > 0) {
        client.del(foundKeys);
      }
    });
  }
};
//@ts-ignore
client.findByMatchKeys = (regKeys: any) => {
  return new Promise(async (resolve, reject) => {
    let result;
    let key;
    regKeys = [].concat(regKeys);
    for (let i = 0, len = regKeys.length; !key && i < len; i++) {
      key = await findMatchKey(regKeys[i]);
    }
    //@ts-ignore
    if (key) result = await client.get(key);
    resolve(result);
  });
};
//@ts-ignore
client.getPrefix = (query) => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    scanner.scan(query, (err, matchingKeys) => {
      if (err) reject(err);
      resolve(matchingKeys);
    });
  });
};
//@ts-ignore
client.delByPrefix = async (prefix) => {
  //@ts-ignore
  const keys = await client.getPrefix(prefix);
  //@ts-ignore
  if (keys) client.delByMatchKeys(keys);
};
//@ts-ignore
client.invokeToken = (token: any) => client.set(token, "invoke");

export default client;
