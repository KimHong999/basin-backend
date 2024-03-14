import User from "~/app/models/User";
import { Request, Response } from "express";
import { pagination, paging } from "~/app/helper/utils";
import { userSerializer } from "~/app/serializer/api/users";

export const list = async (req: Request, res: Response) => {
  try {
    const { query } = req;
    const page = paging(req);
    const games = await User.list({ params: query, paging: page });
    const meta = pagination(games.total, page.perPage, page.page);
    return res
      .status(200)
      .json({ data: games?.results?.map(userSerializer), meta });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

export const detail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.query().findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ data: userSerializer(user) });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};
