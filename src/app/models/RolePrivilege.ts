import "dotenv/config";
import { Model } from "objection";

class RolePrivilege extends Model {
  static get tableName() {
    return "role_privileges";
  }

  static relationMappings = {
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Role",
      join: {
        from: "role_privileges.role_id",
        to: "roles.id",
      },
    },
    privilege: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Privilege",
      join: {
        from: "role_privileges.privilege_id",
        to: "privileges.id",
      },
    },
  };
}

export default RolePrivilege;
