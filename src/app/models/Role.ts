import "dotenv/config";
import { Model } from "objection";

class Role extends Model {
  static get tableName() {
    return "roles";
  }
  static relationMappings = {
    privileges: {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/Privilege",
      join: {
        from: "roles.id",
        through: {
          from: "role_privileges.role_id",
          to: "role_privileges.privilege_id",
        },
        to: "privileges.id",
      },
    },
  };
}

export default Role;
