//@ts-ignore
import { Request, Response } from "express";
import { getImage } from "~/app/helper/image";

export const create = async (req: Request, res: Response) => {
  try {
    const image = req.file as any;
    let filename = ''

    if (image) {
      filename = image.key || image.filename;
    }
    res.status(200).json({ data: getImage(filename) });
  } catch (error) {
    return res.status(400).json({ message: "Internal Server Error" });
  }
};
