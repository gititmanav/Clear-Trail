import type { Request, Response } from "express";
import { userService } from "../services/userService.js";

export const userController = {
  async getAll(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const result = await userService.getAll(companyId);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const user = await userService.getById(req.params.id!, companyId);
    res.json(user);
  },

  async create(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const user = await userService.create(req.body, companyId);
    res.status(201).json(user);
  },

  async update(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const user = await userService.update(req.params.id!, req.body, companyId);
    res.json(user);
  },

  async delete(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const requestingUserId = req.user!._id.toString();
    const result = await userService.delete(req.params.id!, companyId, requestingUserId);
    res.json(result);
  },
};
