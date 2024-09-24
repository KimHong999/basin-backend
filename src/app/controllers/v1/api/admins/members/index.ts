import { Request, Response } from "express";
import User from "~/app/models/User";

export const lists = async (req: Request, res: Response) => {
  try {
    const members = await User.query();

    return res.status(200).json({ data: members });
  } catch (error) {
    res.status(500).json({ message: "InternalError" });
  }
};

export const detail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.query().findById(id);

    if (!user) return res.status(404).json({ message: "not found" });

    return res.status(200).json({ data: user });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "InternalError" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const params = req.parameters
      .permit("email", "username", "password")
      .value();

    console.log(params);

    const member = await User.query().insert(params).returning("*");

    return res.status(200).json({ data: member });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "InternalError" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.query().findById(id);

    if (!user) return res.status(404).json({ message: "not found" });
    const params = req.parameters
      .permit("email", "username", "password")
      .value();

    await user.$query().patch(params);

    return res.status(200).json({ data: user });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "InternalError" });
  }
};

export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.query().findById(id);

    if (!user) return res.status(404).json({ message: "not found" });

    await user.$query().delete();

    return res.status(200).json({ message: "Delete Success" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "InternalError" });
  }
};
