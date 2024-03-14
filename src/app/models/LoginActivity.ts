import { Model } from "objection";

class LoginActivity extends Model {
  static get tableName() {
    return "login_activities";
  }

  static relationMappings = {
    admin: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Admin",
      join: {
        from: "login_activities.admin_id",
        to: "admins.id",
      },
    },
  };
}

export default LoginActivity;
