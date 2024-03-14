import { getImage } from "~/app/helper/image";
import { pick } from "~/app/helper/utils";
import { subscriptionSerializer } from "./subscriptions";

export const userSerializer = (user: any) => {
  user.profile = getImage(user.profile);
  user.cover = getImage(user.cover);
  if (user.wallet) {
    user.wallet = user.wallet.balance;
  }

  if (user.subscribe) {
    user.subscribe = subscriptionSerializer(user.subscribe)
  }

  return pick(user, [
    "id",
    "email",
    "profile",
    "phone",
    "first_name",
    "last_name",
    "gender",
    "created_at",
    "referral",
    "address",
    "wallet",
    "bio",
    "cover",
    "dob",
    "username",
    "subscribe"
  ]);
};

export const userSummarySerializer = (user: any) => {
  user.profile = getImage(user.profile);
  return pick(user, ["id", "username", "profile"]);
};