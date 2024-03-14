import "dotenv/config";
import { Model } from "objection";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { getImage } from "~/app/helper/image";

class Admin extends Model {
  static tableName = "admins";
  static relationMappings = {
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Role",
      join: {
        from: "admins.role_id",
        to: "roles.id",
      },
    },
  };
  validPassword(password: any) {
    //@ts-ignore
    return bcrypt.compareSync(password, this.password || "");
  }

  static generatePassword = async (password: string) => {
    return bcrypt.hashSync(password, 12);
  };

  static get modifiers() {
    return {
      filter(query: any, params: any) {
        if (params.email) {
          query.where("email", "like", `%${params.email}%`);
        }
        if (params.name) {
          query.where("name", "like", `%${params.name}%`);
        }
        if (params.register_date) {
          const date = dayjs(params.register_date).format("YYYY-MM-DD");
          query.whereRaw(`DATE(created_at) = '${date}'`);
        }
        if (params?.role_id) {
          query.where({
            role_id: params.role_id,
          });
        }
        if (params?.status) {
          query.where({
            status: params.status,
          });
        }
      },
    };
  }
  get profileUrl() {
    // @ts-ignore
    return getImage(this.profile);
  }

  static list = async ({
    params,
    paging = { page: 0, perPage: 20 }
  }: {
    params?: any,
    paging: { page: number, perPage: number }
  }) => {
    return await Admin.query()
      .withGraphFetched("role")
      .modify("filter", params)
      .orderBy("id", "desc")
      .page(paging.page, paging.perPage)
  }

}

export default Admin;
