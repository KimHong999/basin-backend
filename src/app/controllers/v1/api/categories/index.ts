import { Request, Response } from "express";
import Category from "~/app/models/Categoy";

export const list = async (req: Request, res: Response) => {
  try {
    const categories = await Category.query();
    return res.status(200).json({ data: categories });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal Error" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const params = req.parameters.permit("name", "status").value();
    const category = await Category.query().insert(params).returning("*");
    return res.status(200).json({ data: category });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal Error" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const product = await Category.query().findById(id);
    if(!product) return res.status(404).json({message: "not found"})
    const params = req.parameters
      .permit("name", "status")
      .values();
  } catch (error) {
    res.status(500).json({message: "Internal Error"})
  }
};
