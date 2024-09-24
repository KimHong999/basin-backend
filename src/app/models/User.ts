import "dotenv/config";
import { Model } from "objection";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { getImage } from "~/app/helper/image";

class User extends Model {
  static tableName = "users";
  id!: number;
  name!: string;
  profile!: string;

  // static relationMappings = {
  //   reviews: {
  //     relation: Model.HasManyRelation,
  //     modelClass: __dirname + "/Review",
  //     join: {
  //       from: "users.id",
  //       to: "reviews.user_id",
  //     },
  //   },
  //   followings: {
  //     relation: Model.HasManyRelation,
  //     modelClass: __dirname + "/Friends",
  //     join: {
  //       from: "users.id",
  //       to: "friends.follower_id",
  //     },
  //   },
  //   followers: {
  //     relation: Model.BelongsToOneRelation,
  //     modelClass: __dirname + "/User",
  //     join: {
  //       from: "users.id",
  //       to: "friends.following_id",
  //     },
  //   },
  //   campaigns: {
  //     relation: Model.HasManyRelation,
  //     modelClass: __dirname + "/Campaign",
  //     join: {
  //       from: "users.id",
  //       to: "campaigns.user_id",
  //     },
  //   },
  //   posts: {
  //     relation: Model.HasManyRelation,
  //     modelClass: __dirname + "/Post",
  //     join: {
  //       from: "users.id",
  //       to: "posts.user_id",
  //     },
  //   },
  //   subscribes: {
  //     relation: Model.HasManyRelation,
  //     modelClass: __dirname + "/Subscription",
  //     join: {
  //       from: "users.id",
  //       to: "subscriptions.user_id"
  //     }
  //   },
  //   subscribe: {
  //     relation: Model.HasOneRelation,
  //     modelClass: __dirname + "/Subscription",
  //     join: {
  //       from: "users.id",
  //       to: "subscriptions.user_id"
  //     },
  //     filter(builder: any) {
  //       builder.where("subscriptions.ended_at", ">", "now()").first()
  //     },
  //   }
  // };

  get profileUrl() {
    return getImage(this.profile);
  }

  validPassword(password: any) {
    //@ts-ignore
    return bcrypt.compareSync(password, this.password || "");
  }
  static generateOtp = () =>
    process.env.APP_ENV === "production"
      ? crypto.randomInt(100000, 999999)
      : 123456;

  static generatePassword = async (password: string) => {
    return bcrypt.hashSync(password, 12);
  };
  static modifiers = {
    filter: (query: any, params: any) => {
      if (params?.username) {
        query.where("username", "like", `%${params.username}%`);
      }
      if (params?.email) {
        query.where("email", "like", `%${params.email}%`);
      }
      if (params?.phone) {
        query.where("phone", "like", `%${params.phone}%`);
      }
      if (params?.gender) {
        query.where("gender", "like", `%${params.gender}%`);
      }
    },
  };

  static list = async ({
    params,
    paging = { perPage: 20, page: 0 },
  }: {
    params?: any;
    paging: { perPage: number; page: number };
  }) => {
    return await User.query()
      .page(paging.page, paging.perPage)
      .modify("filter", params)
      .orderBy("id", "desc");
  };

  async resetPassword(password: string) {
    const password_encryption = await User.generatePassword(password);
    await this.$query().patch({
      //@ts-ignore
      password: password_encryption,
      reset_password_token: null,
      reset_password_sent_at: null,
    });
  }
}

export default User;
