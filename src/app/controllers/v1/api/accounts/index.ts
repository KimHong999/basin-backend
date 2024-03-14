//@ts-ignore
import { Parameters } from "strong-params";
import { Request, Response } from "express";
import { pagination, paging } from "~/app/helper/utils";
import User from "~/app/models/User";

import bcrypt from "bcrypt";
import { userSerializer } from "~/app/serializer/api/users";

export const profile = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      data: userSerializer(req.currentUser),
    });
  } catch (error) {
    return res.status(400).json({ error: "Internal Server Error" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const {
      currentUser: { id },
    } = req;
    const params = Parameters(req.body).permit("username", "bio").value();

    const { profile, cover } = req.files as any;
    if (profile?.length) {
      params.profile = profile[0].key || profile[0].filename;
    }
    if (cover?.length) {
      params.cover = cover[0].key || cover[0].filename;
    }

    await User.query().findById(id).patch(params);
    const user = await User.query().withGraphFetched("subscribe").findById(id);

    res.status(200).json({ data: userSerializer(user) });
  } catch (error) {
    return res.status(400).json({ error: "Internal Server Error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const users = req.currentUser;
    if (users.provider) {
      return res.status(400).json({
        message:
          "You can't change your password, because you are using social media login",
      });
    }
    const params = Parameters(req.body)
      .permit("current_password", "new_password", "confirm_password")
      .value();

    const hash = bcrypt.hashSync(params.new_password, 12);
    await users.$query().patch({
      password: hash,
    });
    return res.status(200).json({
      message: "You have successfully update your password",
    });
  } catch (error) {
    return res.status(400).json({ message: req.__("flash.internal_error") });
  }
};
