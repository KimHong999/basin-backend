import "dotenv/config";
import { Model } from "objection";

class Privilege extends Model {
  static get tableName() {
    return "privileges";
  }
  static relationMappings = {
    roles: {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/Role",
      join: {
        from: "privileges.id",
        through: {
          from: "role_privileges.role_id",
          to: "role_privileges.privilege_id",
        },
        to: "roles.id",
      },
    },
  };
}

export default Privilege;
