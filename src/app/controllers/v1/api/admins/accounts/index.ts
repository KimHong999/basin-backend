import { Request, Response } from "express";
import { profileSerializer } from "~/app/serializer/admins/profile";

export const profile = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      data: profileSerializer(req.currentUser),
    });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};
