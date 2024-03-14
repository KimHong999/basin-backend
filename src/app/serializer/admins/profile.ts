import { getImage } from "~/app/helper/image";
import { pick } from "../../helper/utils";
import { privilegeListSerializer } from "./role";

export const profileSerializer = (account: any) => {
  account.profile = getImage(account.profile);
  account.cover = getImage(account.cover);

  if (account.role) {
    account.role = {
      id: account.role.id,
      name: account.role.name,
      privileges: account.role.privileges?.map(privilegeListSerializer),
    };
  }

  return pick(account, [
    "id",
    "name",
    "first_name",
    "last_name",
    "bio",
    "email",
    "profile",
    "cover",
    "role",
    "status",
    "wallet_id",
  ]);
};
