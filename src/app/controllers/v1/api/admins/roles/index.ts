import Privilege from "~/app/models/Privilege";
import Role from "~/app/models/Role";
import RolePrivilege from "~/app/models/RolePrivilege";
import {
  roleListSerializer,
  privilegeListSerializer,
  detailRoleSerializer,
} from "~/app/serializer/admins/role";
import { pagination, paging } from "~/app/helper/utils";
import _ from "lodash";
import { Request, Response } from "express";

export const list = async (req: Request, res: Response) => {
  try {
    const { perPage, page } = paging(req);
    const roles = await Role.query().page(page, perPage);
    const meta = pagination(roles.total, perPage, page);
    res.status(200).json({
      data: roles.results.map(roleListSerializer),
      meta,
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const params = req.parameters
      .permit("name", {
        privileges: [],
      })
      .value();
    const privileges = params.privileges || [];
    const role = (await Role.query()
      .insert({
        name: params.name,
      })
      .returning("*")) as any;
    const insertData = privileges.map((item: any) => ({
      role_id: role.id,
      privilege_id: item,
    }));
    await RolePrivilege.query().insert(insertData);
    res.status(200).json({
      message: "Role has been successfully created.",
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

export const listPrivileges = async (req: Request, res: Response) => {
  try {
    const privileges = await Privilege.query();
    res.status(200).json({
      data: privileges.map(privilegeListSerializer),
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

export const detail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.query()
      .findById(id)
      .withGraphFetched("privileges(orderById)")
      .modifiers({
        orderById(builder) {
          builder.orderBy("privileges.id", "asc");
        },
      });
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }
    res.status(200).json({
      data: detailRoleSerializer(role),
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const params = req.parameters
      .permit(
        "name",
        {
          privileges: [],
        },
        {
          removeChecking: [],
        }
      )
      .value();
    const role = (await Role.query().findById(id)) as any;
    const privilegesIds = params.privileges.map((item: any) => item);
    if (privilegesIds.length) {
      const exisitingPrivileges = await RolePrivilege.query()
        .where("role_id", id)
        .whereIn("privilege_id", privilegesIds);
      const exisitingPrivilegesIds = exisitingPrivileges.map((item: any) =>
        parseInt(item.privilege_id)
      );
      const findNewPrivileges = privilegesIds.filter(
        (item: any) => !exisitingPrivilegesIds.includes(item)
      );

      if (findNewPrivileges.length) {
        const insertData = findNewPrivileges.map((item: any) => ({
          role_id: role.id,
          privilege_id: item,
        }));
        await RolePrivilege.query().insert(insertData);
      }
    }
    if (params.removeChecking.length) {
      await RolePrivilege.query()
        .delete()
        .where("role_id", id)
        .whereIn("privilege_id", params.removeChecking);
    }
    await role.$query().patch({
      name: params.name,
    });
    res.status(200).json({
      message: "Role has been successfully updated.",
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};
